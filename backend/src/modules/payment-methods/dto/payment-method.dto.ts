import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ModalidadePagamento } from '@prisma/client';

export class CreatePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(ModalidadePagamento)
  modalidade: ModalidadePagamento;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaFechamento?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaVencimento?: number;

  @IsString()
  @IsNotEmpty()
  instituicaoBanco: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEnum(ModalidadePagamento)
  modalidade?: ModalidadePagamento;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaFechamento?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaVencimento?: number;

  @IsOptional()
  @IsString()
  instituicaoBanco?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
