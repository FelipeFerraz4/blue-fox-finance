import { Injectable } from '@nestjs/common';
import { ModalidadePagamento, TipoLancamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BillsService } from '../bills/bills.service';
import { BillScheduleHelper } from '../../common/helpers/bill-schedule.helper';
import { AnalyticsBasis } from './dto/analytics-query.dto';

/** Linha compacta usada pelo filtro cruzado no cliente. */
export interface AnalyticsFact {
  id: string;
  lancamentoId: string;
  mes: number; // 1-12
  data: Date;
  valor: number;
  nome: string;
  categoria: string;
  loja: string;
  categoriaLoja: string | null;
  comprador: string;
  meioPagamentoId: string;
  meioPagamento: string;
  modalidade: ModalidadePagamento;
  tipo: TipoLancamento;
  parcela: string | null; // "3/12" na visão de faturas
}

const LANCAMENTO_SELECT = {
  id: true,
  nome: true,
  categoria: true,
  loja: true,
  comprador: true,
  data: true,
  tipo: true,
  valorTotal: true,
  meioPagamentoId: true,
  lojaRel: { select: { categoria: true } },
  meioPagamento: { select: { nome: true, modalidade: true } },
} as const;

const round2 = (n: number) => Number(n.toFixed(2));

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billsService: BillsService,
  ) {}

  async getOverview(userId: string, year: number, basis: AnalyticsBasis) {
    const [facts, anoAnterior, compromissosFuturos, contas] = await Promise.all([
      basis === 'fatura' ? this.installmentFacts(userId, year) : this.purchaseFacts(userId, year),
      this.monthlyTotals(userId, year - 1, basis),
      this.futureCommitments(userId),
      this.billsService.getYearSummary(userId, year),
    ]);

    return { year, basis, facts, anoAnterior, compromissosFuturos, contas };
  }

  /** Visão "Compras": um lançamento inteiro no mês da data da compra. */
  private async purchaseFacts(userId: string, year: number): Promise<AnalyticsFact[]> {
    const lancamentos = await this.prisma.lancamento.findMany({
      where: { userId, data: this.yearRange(year) },
      select: LANCAMENTO_SELECT,
      orderBy: { data: 'desc' },
    });

    return lancamentos.map((l) => ({
      id: l.id,
      lancamentoId: l.id,
      // Datas são gravadas como meia-noite UTC (YYYY-MM-DD): o mês vem em UTC
      mes: l.data.getUTCMonth() + 1,
      data: l.data,
      valor: Number(l.valorTotal),
      nome: l.nome,
      categoria: l.categoria,
      loja: l.loja,
      categoriaLoja: l.lojaRel?.categoria ?? null,
      comprador: l.comprador,
      meioPagamentoId: l.meioPagamentoId,
      meioPagamento: l.meioPagamento.nome,
      modalidade: l.meioPagamento.modalidade,
      tipo: l.tipo,
      parcela: null,
    }));
  }

  /** Visão "Faturas": cada parcela no mês em que vence. */
  private async installmentFacts(userId: string, year: number): Promise<AnalyticsFact[]> {
    const parcelas = await this.prisma.parcela.findMany({
      where: { mesReferencia: { startsWith: `${year}-` }, lancamento: { userId } },
      select: {
        id: true,
        valor: true,
        numero: true,
        totalParcelas: true,
        mesReferencia: true,
        lancamento: { select: LANCAMENTO_SELECT },
      },
      orderBy: [{ mesReferencia: 'desc' }, { dataVencimento: 'desc' }],
    });

    return parcelas.map((p) => {
      const l = p.lancamento;
      return {
        id: p.id,
        lancamentoId: l.id,
        mes: Number(p.mesReferencia.slice(5, 7)),
        data: l.data,
        valor: Number(p.valor),
        nome: l.nome,
        categoria: l.categoria,
        loja: l.loja,
        categoriaLoja: l.lojaRel?.categoria ?? null,
        comprador: l.comprador,
        meioPagamentoId: l.meioPagamentoId,
        meioPagamento: l.meioPagamento.nome,
        modalidade: l.meioPagamento.modalidade,
        tipo: l.tipo,
        parcela: p.totalParcelas > 1 ? `${p.numero}/${p.totalParcelas}` : null,
      };
    });
  }

  /** Total por mês (índice 0 = janeiro) na mesma visão, para o comparativo. */
  private async monthlyTotals(userId: string, year: number, basis: AnalyticsBasis): Promise<number[]> {
    const totals = Array<number>(12).fill(0);

    if (basis === 'fatura') {
      const parcelas = await this.prisma.parcela.findMany({
        where: { mesReferencia: { startsWith: `${year}-` }, lancamento: { userId } },
        select: { valor: true, mesReferencia: true },
      });
      for (const p of parcelas) {
        totals[Number(p.mesReferencia.slice(5, 7)) - 1] += Number(p.valor);
      }
    } else {
      const lancamentos = await this.prisma.lancamento.findMany({
        where: { userId, data: this.yearRange(year) },
        select: { valorTotal: true, data: true },
      });
      for (const l of lancamentos) {
        totals[l.data.getUTCMonth()] += Number(l.valorTotal);
      }
    }

    return totals.map(round2);
  }

  /**
   * Parcelas ainda não pagas dos próximos 12 meses (a partir do mês atual), por mês e por
   * meio de pagamento, e os parcelamentos que continuam em aberto.
   */
  private async futureCommitments(userId: string) {
    const fromMonth = BillScheduleHelper.currentMonth();
    const months = BillScheduleHelper.monthRange(fromMonth, BillScheduleHelper.addMonths(fromMonth, 11));

    const parcelas = await this.prisma.parcela.findMany({
      where: { pago: false, mesReferencia: { gte: fromMonth }, lancamento: { userId } },
      select: {
        valor: true,
        numero: true,
        totalParcelas: true,
        mesReferencia: true,
        lancamento: {
          select: {
            id: true,
            nome: true,
            loja: true,
            tipo: true,
            meioPagamentoId: true,
            meioPagamento: { select: { nome: true } },
          },
        },
      },
      orderBy: { mesReferencia: 'asc' },
    });

    const porMes = months.map((mes) => ({ mes, total: 0, porMeio: {} as Record<string, number> }));
    const meios = new Map<string, string>();
    const abertos = new Map<
      string,
      { lancamentoId: string; nome: string; loja: string; meioPagamento: string; valorParcela: number; restantes: number; totalRestante: number; ultimoMes: string; proximaParcela: string }
    >();

    for (const p of parcelas) {
      const l = p.lancamento;
      const valor = Number(p.valor);
      meios.set(l.meioPagamentoId, l.meioPagamento.nome);

      const bucket = porMes.find((m) => m.mes === p.mesReferencia);
      if (bucket) {
        bucket.total += valor;
        bucket.porMeio[l.meioPagamentoId] = (bucket.porMeio[l.meioPagamentoId] ?? 0) + valor;
      }

      if (l.tipo === TipoLancamento.PARCELADO) {
        const item = abertos.get(l.id) ?? {
          lancamentoId: l.id,
          nome: l.nome,
          loja: l.loja,
          meioPagamento: l.meioPagamento.nome,
          valorParcela: valor,
          restantes: 0,
          totalRestante: 0,
          ultimoMes: p.mesReferencia,
          proximaParcela: `${p.numero}/${p.totalParcelas}`,
        };
        item.restantes += 1;
        item.totalRestante += valor;
        if (p.mesReferencia > item.ultimoMes) item.ultimoMes = p.mesReferencia;
        abertos.set(l.id, item);
      }
    }

    return {
      meses: porMes.map((m) => ({
        mes: m.mes,
        total: round2(m.total),
        porMeio: Object.fromEntries(Object.entries(m.porMeio).map(([k, v]) => [k, round2(v)])),
      })),
      meiosPagamento: [...meios].map(([id, nome]) => ({ id, nome })),
      parcelamentosAbertos: [...abertos.values()]
        .map((a) => ({ ...a, totalRestante: round2(a.totalRestante) }))
        .sort((a, b) => b.ultimoMes.localeCompare(a.ultimoMes) || b.totalRestante - a.totalRestante),
      totalFuturo: round2(parcelas.reduce((acc, p) => acc + Number(p.valor), 0)),
    };
  }

  private yearRange(year: number) {
    return { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) };
  }
}
