import { Injectable } from '@nestjs/common';
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
