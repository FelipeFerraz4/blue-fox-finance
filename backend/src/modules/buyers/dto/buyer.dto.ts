import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBuyerDto {
  @IsString({ message: 'O nome do comprador deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do comprador é obrigatório.' })
  nome: string;

  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}

export class UpdateBuyerDto {
  @IsOptional()
  @IsString({ message: 'O nome do comprador deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do comprador não pode ser vazio.' })
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
