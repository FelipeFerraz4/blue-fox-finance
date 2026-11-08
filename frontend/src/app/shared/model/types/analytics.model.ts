import { ModalidadePagamento } from './payment-method.model';
import { TipoLancamento } from './lancamento.model';

/** compra = mês da data da compra; fatura = mês de vencimento de cada parcela. */
export type AnalyticsBasis = 'compra' | 'fatura';

/** Linha compacta (lançamento ou parcela) usada no filtro cruzado. */
export interface AnalyticsFact {
  id: string;
  lancamentoId: string;
  mes: number;
  data: string;
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
  parcela: string | null;
}

export interface FutureCommitments {
  meses: Array<{ mes: string; total: number; porMeio: Record<string, number> }>;
  meiosPagamento: Array<{ id: string; nome: string }>;
  parcelamentosAbertos: Array<{
    lancamentoId: string;
    nome: string;
    loja: string;
    meioPagamento: string;
    valorParcela: number;
    restantes: number;
    totalRestante: number;
    ultimoMes: string;
    proximaParcela: string;
  }>;
  totalFuturo: number;
}

export interface BillsMonthSummary {
  mes: number;
  pago: number;
  pendente: number;
  quantidadePaga: number;
  quantidadePendente: number;
  quantidadeAtrasada: number;
  semValor: number;
}

export interface AnalyticsOverview {
  year: number;
  basis: AnalyticsBasis;
  facts: AnalyticsFact[];
  anoAnterior: number[];
  compromissosFuturos: FutureCommitments;
  contas: BillsMonthSummary[];
}

/** Dimensões que aceitam filtro cruzado (clique num gráfico). */
export type AnalyticsDimension =
  | 'mes'
  | 'categoria'
  | 'meioPagamentoId'
  | 'loja'
  | 'comprador'
  | 'categoriaLoja'
  | 'tipo';

export type AnalyticsFilters = Partial<Record<AnalyticsDimension, string | number>>;

export interface DimensionSlice {
  key: string;
  label: string;
  total: number;
  count: number;
}
