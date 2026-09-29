export type ModalidadePagamento = 'CREDITO' | 'DEBITO' | 'DINHEIRO_CONTA' | 'OUTRO';

export interface PaymentMethod {
  id: string;
  nome: string;
  modalidade: ModalidadePagamento;
  diaFechamento?: number | null;
  diaVencimento?: number | null;
  instituicaoBanco: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentMethodDto {
  nome: string;
  modalidade: ModalidadePagamento;
  diaFechamento?: number | null;
  diaVencimento?: number | null;
  instituicaoBanco: string;
  ativo?: boolean;
}
