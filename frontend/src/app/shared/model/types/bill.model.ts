export type RecorrenciaConta = 'MENSAL' | 'ANUAL' | 'UNICA';

export type BillStatus = 'PAGA' | 'ATRASADA' | 'VENCE_HOJE' | 'PROXIMA' | 'PENDENTE';

/** Regra de uma conta a pagar (energia, internet, fatura do cartão...). */
export interface Bill {
  id: string;
  userId: string;
  nome: string;
  categoria: string | null;
  recorrencia: RecorrenciaConta;
  diaVencimento: number | null;
  mesVencimento: number | null;
  dataUnica: string | null;
  valorPrevisto: number | string | null;
  meioPagamentoId: string | null;
  meioPagamento?: {
    id: string;
    nome: string;
    instituicaoBanco: string;
    diaVencimento: number | null;
  } | null;
  lembrarDiasAntes: number;
  dataInicio: string;
  ativo: boolean;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillDto {
  nome: string;
  categoria?: string | null;
  recorrencia: RecorrenciaConta;
  diaVencimento?: number | null;
  mesVencimento?: number | null;
  dataUnica?: string | null;
  valorPrevisto?: number | null;
  meioPagamentoId?: string | null;
  lembrarDiasAntes?: number;
  dataInicio?: string;
  ativo?: boolean;
  observacoes?: string | null;
}

/** Ocorrência de uma conta em um mês; pendente até ser marcada como paga. */
export interface BillOccurrence {
  id: string;
  contaId: string;
  nome: string;
  categoria: string | null;
  recorrencia: RecorrenciaConta;
  meioPagamentoId: string | null;
  mesReferencia: string;
  dataVencimento: string;
  valor: number | null;
  valorDaFatura: boolean;
  valorPago: number | null;
  pagoEm: string | null;
  status: BillStatus;
  diasParaVencer: number;
}

export interface BillMonthOverview {
  mesReferencia: string;
  ocorrencias: BillOccurrence[];
  atrasadasAnteriores: BillOccurrence[];
  totais: {
    previsto: number;
    pago: number;
    pendente: number;
    quantidadePendente: number;
  };
}

export interface BillAlerts {
  atrasadas: BillOccurrence[];
  venceHoje: BillOccurrence[];
  proximas: BillOccurrence[];
  total: number;
}

export interface PayBillOccurrenceDto {
  valorPago?: number;
  pagoEm?: string;
}
