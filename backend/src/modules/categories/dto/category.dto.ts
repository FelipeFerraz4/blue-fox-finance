import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateItemCategoryDto {
  @IsString({ message: 'O nome da categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'A cor deve ser um texto hexadecimal (ex: #38b6ff).' })
  cor?: string;

  @IsOptional()
  @IsString({ message: 'O ícone deve ser um texto identificador.' })
  icone?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}

export class UpdateItemCategoryDto {
  @IsOptional()
  @IsString({ message: 'O nome da categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da categoria não pode ser vazio.' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'A cor deve ser um texto hexadecimal.' })
  cor?: string;

  @IsOptional()
  @IsString({ message: 'O ícone deve ser um texto identificador.' })
  icone?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}

export class CreateStoreCategoryDto {
  @IsString({ message: 'O nome da categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}

export class UpdateStoreCategoryDto {
  @IsOptional()
  @IsString({ message: 'O nome da categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da categoria não pode ser vazio.' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
