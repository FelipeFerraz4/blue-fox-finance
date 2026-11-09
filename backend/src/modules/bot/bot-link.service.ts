import { Injectable } from '@nestjs/common';
import { CanalBot, Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationState } from './bot.types';

const CODE_TTL_MS = 10 * 60 * 1000;

const hash = (code: string) => createHash('sha256').update(code).digest('hex');

/** Vínculo conta ↔ canal de mensagem e estado das conversas. */
@Injectable()
export class BotLinkService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Vínculo
  // ---------------------------------------------------------------------------

  /** Gera um código de uso único (10 min). Só o hash fica no banco. */
  async createLinkCode(userId: string) {
    const code = randomBytes(16).toString('base64url');
    const expiraEm = new Date(Date.now() + CODE_TTL_MS);
    await this.prisma.$transaction([
      // Um código válido por vez: o novo invalida os anteriores
      this.prisma.botCodigoVinculo.deleteMany({ where: { userId } }),
      this.prisma.botCodigoVinculo.create({ data: { codeHash: hash(code), userId, expiraEm } }),
    ]);
    return { code, expiraEm };
  }

  getLink(userId: string) {
    return this.prisma.botVinculo.findUnique({
      where: { userId },
      select: { canal: true, username: true, createdAt: true },
    });
  }

  async unlinkUser(userId: string) {
    const link = await this.prisma.botVinculo.findUnique({ where: { userId } });
    if (!link) return false;
    await this.prisma.$transaction([
      this.prisma.botConversa.deleteMany({ where: { canal: link.canal, externalUserId: link.externalUserId } }),
      this.prisma.botVinculo.delete({ where: { userId } }),
    ]);
    return true;
  }

  findUserId(canal: CanalBot, externalUserId: string) {
    return this.prisma.botVinculo
      .findUnique({ where: { canal_externalUserId: { canal, externalUserId } }, select: { userId: true } })
      .then((link) => link?.userId ?? null);
  }

  /**
   * Consome o código e vincula o usuário do canal à conta.
   * Substitui vínculos anteriores da conta e deste usuário do canal (1 ↔ 1).
   */
  async consumeLinkCode(
    code: string,
    canal: CanalBot,
    externalUserId: string,
    chatId: string,
    username?: string,
  ): Promise<{ ok: true; userId: string } | { ok: false }> {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      // updateMany com condição garante uso único mesmo com dois /start simultâneos
      const claimed = await tx.botCodigoVinculo.updateMany({
        where: { codeHash: hash(code), usadoEm: null, expiraEm: { gt: now } },
        data: { usadoEm: now },
      });
      if (claimed.count !== 1) return { ok: false as const };

      const { userId } = await tx.botCodigoVinculo.findUniqueOrThrow({ where: { codeHash: hash(code) } });
      await tx.botVinculo.deleteMany({
        where: { OR: [{ userId }, { canal, externalUserId }] },
      });
      await tx.botConversa.deleteMany({ where: { canal, externalUserId } });
      await tx.botVinculo.create({
        data: { userId, canal, externalUserId, chatId, username: username ?? null },
      });
      return { ok: true as const, userId };
    });
  }

  // ---------------------------------------------------------------------------
  // Estado da conversa
  // ---------------------------------------------------------------------------

  async getState(canal: CanalBot, externalUserId: string): Promise<ConversationState | null> {
    const row = await this.prisma.botConversa.findUnique({
      where: { canal_externalUserId: { canal, externalUserId } },
    });
    return (row?.estado as unknown as ConversationState) ?? null;
  }

  async setState(canal: CanalBot, externalUserId: string, state: ConversationState) {
    const estado = state as unknown as Prisma.InputJsonValue;
    await this.prisma.botConversa.upsert({
      where: { canal_externalUserId: { canal, externalUserId } },
      create: { canal, externalUserId, estado },
      update: { estado },
    });
  }

  async clearState(canal: CanalBot, externalUserId: string) {
    await this.prisma.botConversa.deleteMany({ where: { canal, externalUserId } });
  }

  /**
   * Remove o estado só se o nonce ainda for o atual. Retorna true para quem
   * "ganhou": impede gravar duas vezes com clique repetido ou update reenviado.
   */
  async consumeState(canal: CanalBot, externalUserId: string, nonce: string): Promise<boolean> {
    const { count } = await this.prisma.botConversa.deleteMany({
      where: { canal, externalUserId, estado: { path: ['nonce'], equals: nonce } },
    });
    return count === 1;
  }
}
