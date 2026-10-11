import { PaymentMethod } from './payment-method.model';
import { Store } from './store.model';
import { Buyer } from './buyer.model';

export type TipoLancamento = 'A_VISTA' | 'PARCELADO';

export interface Parcela {
  id: string;
  lancamentoId: string;
  numero: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string;
  mesReferencia: string;
  pago: boolean;
}

export interface Lancamento {
  id: string;
  codigo: string;
  comprador: string;
  compradorId?: string | null;
  compradorRel?: Buyer | null;
  nome: string;
  loja: string;
  lojaId?: string | null;
  lojaRel?: Store | null;
  data: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  meioPagamentoId: string;
  meioPagamento?: PaymentMethod;
  tipo: TipoLancamento;
  numeroParcelas: number;
  observacoes?: string;
  parcelas?: Parcela[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLancamentoDto {
  codigo?: string;
  comprador: string;
  compradorId?: string;
  nome: string;
  loja: string;
  lojaId?: string;
  data: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal?: number;
  meioPagamentoId: string;
  tipo: TipoLancamento;
  numeroParcelas?: number;
  observacoes?: string;
}

export interface PaginatedExpenses {
  data: Lancamento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LancamentoGrouped {
  data: string;
  dataFormatada: string;
  loja: string;
  totalValor: number;
  totalItens: number;
  itens: Lancamento[];
}

export interface PreviewInstallmentItem {
  numero: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string;
  mesReferencia: string;
}
