export interface Store {
  id: string;
  nome: string;
  categoria?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreDto {
  nome: string;
  categoria?: string;
}
