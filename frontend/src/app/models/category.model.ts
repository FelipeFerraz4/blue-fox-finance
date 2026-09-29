export interface CategoriaItem {
  id: string;
  nome: string;
  cor?: string | null;
  icone?: string | null;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoriaItemDto {
  nome: string;
  cor?: string;
  icone?: string;
  ativo?: boolean;
}

export interface UpdateCategoriaItemDto {
  nome?: string;
  cor?: string;
  icone?: string;
  ativo?: boolean;
}

export interface CategoriaLoja {
  id: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoriaLojaDto {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface UpdateCategoriaLojaDto {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}
