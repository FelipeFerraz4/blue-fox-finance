export interface ExpensePreference {
  id: string | null;
  userId: string;
  compradorPadraoId: string | null;
  lojaPadraoId: string | null;
  meioPagamentoPadraoId: string | null;
  categoriaPadrao: string | null;
  compradorPadrao?: {
    id: string;
    nome: string;
    email?: string | null;
  } | null;
  lojaPadrao?: {
    id: string;
    nome: string;
    categoria?: string | null;
  } | null;
  meioPagamentoPadrao?: {
    id: string;
    nome: string;
    instituicaoBanco?: string;
    modalidade?: string;
  } | null;
}

export interface UpdateExpensePreferenceDto {
  compradorPadraoId?: string | null;
  lojaPadraoId?: string | null;
  meioPagamentoPadraoId?: string | null;
  categoriaPadrao?: string | null;
}
