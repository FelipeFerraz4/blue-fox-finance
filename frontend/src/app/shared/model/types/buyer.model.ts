export interface Buyer {
  id: string;
  nome: string;
  email?: string | null;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBuyerDto {
  nome: string;
  email?: string;
  ativo?: boolean;
}

export interface UpdateBuyerDto {
  nome?: string;
  email?: string;
  ativo?: boolean;
}
