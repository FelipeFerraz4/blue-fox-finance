import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DashboardOverview {
  mesReferencia: string;
  totalPagarEsteMes: number;
  totalPagarProximoMes: number;
  saldoDevedorFuturo: number;
  totalGeralContratado: number;
  totalParceladoMes: number;
  totalAVistaMes: number;
  detalhamentoComprasMes: Array<{
    id: string;
    codigo: string;
    comprador: string;
    itemCompra: string;
    loja: string;
    data: Date;
    dataVencimento: Date;
    meioPagamento: string;
    tipo: string;
    parcela: string;
    valorParcela: number;
  }>;
  resumoMeioPagamento: Array<{
    meioPagamento: string;
    instituicaoBanco: string;
    totalNoMes: number;
    percentualDoTotal: number;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(month?: string): Promise<DashboardOverview> {
    // Definir mês de referência (formato YYYY-MM)
    const now = new Date();
    const currentMonthStr =
      month && /^\d{4}-\d{2}$/.test(month)
        ? month
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Calcular próximo mês
    const [year, m] = currentMonthStr.split('-').map(Number);
    const nextDate = new Date(year, m, 1); // m é 1-indexed, logo m no Date é o próximo mês
    const nextMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

    // 1. Parcelas do Mês Atual
    const parcelasMesAtual = await this.prisma.parcela.findMany({
      where: { mesReferencia: currentMonthStr },
      include: {
        lancamento: {
          include: {
            meioPagamento: true,
          },
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });

    const totalPagarEsteMes = Number(
      parcelasMesAtual.reduce((acc, p) => acc + Number(p.valor), 0).toFixed(2),
    );

    // 2. Parcelas do Próximo Mês
    const parcelasProximoMes = await this.prisma.parcela.findMany({
      where: { mesReferencia: nextMonthStr },
    });
    const totalPagarProximoMes = Number(
      parcelasProximoMes.reduce((acc, p) => acc + Number(p.valor), 0).toFixed(2),
    );

    // 3. Saldo Devedor Futuro (meses > nextMonthStr)
    const parcelasFuturas = await this.prisma.parcela.findMany({
      where: {
        mesReferencia: { gt: nextMonthStr },
      },
    });
    const saldoDevedorFuturo = Number(
      parcelasFuturas.reduce((acc, p) => acc + Number(p.valor), 0).toFixed(2),
    );

    // 4. Total Geral Contratado (soma de todos os lançamentos)
    const allLancamentos = await this.prisma.lancamento.findMany();
    const totalGeralContratado = Number(
      allLancamentos.reduce((acc, l) => acc + Number(l.valorTotal), 0).toFixed(2),
    );

    // 5. Total Parcelado vs À Vista no Mês
    let totalParceladoMes = 0;
    let totalAVistaMes = 0;

    for (const p of parcelasMesAtual) {
      if (p.lancamento.tipo === 'PARCELADO') {
        totalParceladoMes += Number(p.valor);
      } else {
        totalAVistaMes += Number(p.valor);
      }
    }
    totalParceladoMes = Number(totalParceladoMes.toFixed(2));
    totalAVistaMes = Number(totalAVistaMes.toFixed(2));

    // 6. Detalhamento de Compras & Parcelas do Mês
    const detalhamentoComprasMes = parcelasMesAtual.map((p) => ({
      id: p.id,
      codigo: p.lancamento.codigo,
      comprador: p.lancamento.comprador,
      itemCompra: p.lancamento.nome,
      loja: p.lancamento.loja,
      data: p.lancamento.data,
      dataVencimento: p.dataVencimento,
      meioPagamento: p.lancamento.meioPagamento.nome,
      tipo: p.lancamento.tipo === 'PARCELADO' ? 'Parcelado' : 'À Vista',
      parcela: `${p.numero}/${p.totalParcelas}`,
      valorParcela: Number(p.valor),
    }));

    // 7. Resumo por Meio de Pagamento
    const mapMeios = new Map<string, {
      meioPagamento: string;
      instituicaoBanco: string;
      total: number;
    }>();

    for (const p of parcelasMesAtual) {
      const nome = p.lancamento.meioPagamento.nome;
      const banco = p.lancamento.meioPagamento.instituicaoBanco;
      const val = Number(p.valor);

      if (!mapMeios.has(nome)) {
        mapMeios.set(nome, { meioPagamento: nome, instituicaoBanco: banco, total: 0 });
      }
      const item = mapMeios.get(nome)!;
      item.total = Number((item.total + val).toFixed(2));
    }

    const resumoMeioPagamento = Array.from(mapMeios.values())
      .map((item) => ({
        meioPagamento: item.meioPagamento,
        instituicaoBanco: item.instituicaoBanco,
        totalNoMes: item.total,
        percentualDoTotal:
          totalPagarEsteMes > 0
            ? Number(((item.total / totalPagarEsteMes) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.totalNoMes - a.totalNoMes);

    return {
      mesReferencia: currentMonthStr,
      totalPagarEsteMes,
      totalPagarProximoMes,
      saldoDevedorFuturo,
      totalGeralContratado,
      totalParceladoMes,
      totalAVistaMes,
      detalhamentoComprasMes,
      resumoMeioPagamento,
    };
  }
}
