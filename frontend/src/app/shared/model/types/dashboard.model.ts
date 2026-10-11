export interface DetalhamentoCompraMes {
  id: string;
  codigo: string;
  comprador: string;
  itemCompra: string;
  loja: string;
  data: string;
  dataVencimento: string;
  meioPagamento: string;
  tipo: string;
  parcela: string;
  valorParcela: number;
}

export interface ResumoMeioPagamento {
  meioPagamento: string;
  instituicaoBanco: string;
  totalNoMes: number;
  percentualDoTotal: number;
}

export interface DashboardOverview {
  mesReferencia: string;
  totalPagarEsteMes: number;
  totalPagarProximoMes: number;
  saldoDevedorFuturo: number;
  totalGeralContratado: number;
  totalParceladoMes: number;
  totalAVistaMes: number;
  detalhamentoComprasMes: DetalhamentoCompraMes[];
  resumoMeioPagamento: ResumoMeioPagamento[];
}
