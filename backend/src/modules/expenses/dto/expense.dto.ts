import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  IsPositive,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TipoLancamento } from '@prisma/client';

export class CreateExpenseDto {
  @IsOptional()
  @IsString()
  codigo?: string; // Se omitido, backend gera UUID

  // Comprador, loja e categoria precisam estar cadastrados: os nomes gravados
  // vêm do cadastro (comprador/loja em texto são ignorados se enviados)
  @IsOptional()
  @IsString()
  comprador?: string;

  @IsUUID('all', { message: 'Selecione um comprador cadastrado.' })
  compradorId: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  loja?: string;

  @IsUUID('all', { message: 'Selecione uma loja cadastrada.' })
  lojaId: string;

  @IsDateString()
  data: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsNumber()
  @Min(0.01)
  valorUnitario: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  valorTotal?: number;

  @IsUUID()
  meioPagamentoId: string;

  @IsEnum(TipoLancamento)
  tipo: TipoLancamento;

  @IsOptional()
  @IsInt()
  @Min(1)
  numeroParcelas?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class PreviewInstallmentsDto {
  @IsDateString()
  dataCompra: string;

  @IsNumber()
  @Min(0.01)
  valorTotal: number;

  @IsInt()
  @Min(1)
  numeroParcelas: number;

  @IsUUID()
  meioPagamentoId: string;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  comprador?: string;

  @IsOptional()
  @IsUUID()
  compradorId?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  loja?: string;

  @IsOptional()
  @IsUUID()
  lojaId?: string;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  valorUnitario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  valorTotal?: number;

  @IsOptional()
  @IsUUID()
  meioPagamentoId?: string;

  @IsOptional()
  @IsEnum(TipoLancamento)
  tipo?: TipoLancamento;

  @IsOptional()
  @IsInt()
  @Min(1)
  numeroParcelas?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
