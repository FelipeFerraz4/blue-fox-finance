import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateExpensePreferenceDto } from './dto/expense-preference.dto';
import { UpdateLocalePreferenceDto } from './dto/locale-preference.dto';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_REGION,
  Language,
  Region,
  isLanguage,
  isRegion,
} from '../../common/constants/locale';

export interface LocalePreference {
  idioma: Language;
  regiao: Region;
  /** false enquanto o usuário nunca escolheu (o site usa a escolha do navegador) */
  salvo: boolean;
}

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Idioma e país; sem registro, os padrões (pt / BR). */
  async getLocale(userId: string): Promise<LocalePreference> {
    const pref = await this.prisma.preferenciaUsuario.findUnique({ where: { userId } });
    return {
      idioma: isLanguage(pref?.idioma) ? pref.idioma : DEFAULT_LANGUAGE,
      regiao: isRegion(pref?.regiao) ? pref.regiao : DEFAULT_REGION,
      salvo: !!pref,
    };
  }

  async updateLocale(userId: string, dto: UpdateLocalePreferenceDto): Promise<LocalePreference> {
    await this.prisma.preferenciaUsuario.upsert({
      where: { userId },
      create: { userId, idioma: dto.idioma ?? DEFAULT_LANGUAGE, regiao: dto.regiao ?? DEFAULT_REGION },
      update: {
        ...(dto.idioma !== undefined && { idioma: dto.idioma }),
        ...(dto.regiao !== undefined && { regiao: dto.regiao }),
      },
    });
    return this.getLocale(userId);
  }

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
