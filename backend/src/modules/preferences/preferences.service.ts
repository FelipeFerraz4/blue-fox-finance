import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateExpensePreferenceDto } from './dto/expense-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getExpensePreferences(userId: string) {
    const preferences = await this.prisma.preferenciaLancamento.findUnique({
      where: { userId },
      include: {
        compradorPadrao: {
          select: { id: true, nome: true, email: true },
        },
        lojaPadrao: {
          select: { id: true, nome: true, categoria: true },
        },
        meioPagamentoPadrao: {
          select: { id: true, nome: true, instituicaoBanco: true, modalidade: true },
        },
      },
    });

    if (!preferences) {
      return {
        id: null,
        userId,
        compradorPadraoId: null,
        lojaPadraoId: null,
        meioPagamentoPadraoId: null,
        categoriaPadrao: null,
        compradorPadrao: null,
        lojaPadrao: null,
        meioPagamentoPadrao: null,
      };
    }

    return preferences;
  }

  async updateExpensePreferences(userId: string, dto: UpdateExpensePreferenceDto) {
    await this.assertReferencesBelongToUser(userId, dto);

    // Upsert garante que cria se não existir ou atualiza apenas os campos enviados
    return this.prisma.preferenciaLancamento.upsert({
      where: { userId },
      create: {
        userId,
        compradorPadraoId: dto.compradorPadraoId,
        lojaPadraoId: dto.lojaPadraoId,
        meioPagamentoPadraoId: dto.meioPagamentoPadraoId,
        categoriaPadrao: dto.categoriaPadrao,
      },
      update: {
        ...(dto.compradorPadraoId !== undefined && { compradorPadraoId: dto.compradorPadraoId }),
        ...(dto.lojaPadraoId !== undefined && { lojaPadraoId: dto.lojaPadraoId }),
        ...(dto.meioPagamentoPadraoId !== undefined && { meioPagamentoPadraoId: dto.meioPagamentoPadraoId }),
        ...(dto.categoriaPadrao !== undefined && { categoriaPadrao: dto.categoriaPadrao }),
      },
      include: {
        compradorPadrao: {
          select: { id: true, nome: true, email: true },
        },
        lojaPadrao: {
          select: { id: true, nome: true, categoria: true },
        },
        meioPagamentoPadrao: {
          select: { id: true, nome: true, instituicaoBanco: true, modalidade: true },
        },
      },
    });
  }

  /**
   * Garante que comprador, loja e meio de pagamento padrão pertencem ao usuário.
   * Sem isso, um ID de outro usuário seria aceito e o GET exporia nome/e-mail dele.
   */
  private async assertReferencesBelongToUser(userId: string, dto: UpdateExpensePreferenceDto) {
    if (dto.compradorPadraoId) {
      const buyer = await this.prisma.comprador.findFirst({
        where: { id: dto.compradorPadraoId, userId },
        select: { id: true },
      });
      if (!buyer) {
        throw new NotFoundException('Comprador informado não existe ou não pertence ao seu usuário.');
      }
    }

    if (dto.lojaPadraoId) {
      const store = await this.prisma.loja.findFirst({
        where: { id: dto.lojaPadraoId, userId },
        select: { id: true },
      });
      if (!store) {
        throw new NotFoundException('Loja informada não existe ou não pertence ao seu usuário.');
      }
    }

    if (dto.meioPagamentoPadraoId) {
      const method = await this.prisma.paymentMethod.findFirst({
        where: { id: dto.meioPagamentoPadraoId, userId },
        select: { id: true },
      });
      if (!method) {
        throw new NotFoundException('Meio de pagamento informado não existe ou não pertence ao seu usuário.');
      }
    }
  }

  async clearExpensePreferences(userId: string) {
    const existing = await this.prisma.preferenciaLancamento.findUnique({
      where: { userId },
    });

    if (existing) {
      await this.prisma.preferenciaLancamento.delete({
        where: { userId },
      });
    }

    return { success: true };
  }
}
