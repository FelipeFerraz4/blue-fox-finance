import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { RecorrenciaConta } from '@prisma/client';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da conta é obrigatório.' })
  nome: string;

  @IsOptional()
  @IsString()
  categoria?: string | null;

  @IsEnum(RecorrenciaConta)
  recorrencia: RecorrenciaConta;

  // Obrigatório para MENSAL/ANUAL, exceto conta vinculada a cartão (usa o vencimento do cartão)
  @ValidateIf((o) => o.recorrencia !== RecorrenciaConta.UNICA && !o.meioPagamentoId)
  @IsInt({ message: 'Informe o dia de vencimento (1 a 31).' })
  @Min(1)
  @Max(31)
  diaVencimento?: number | null;

  @ValidateIf((o) => o.recorrencia === RecorrenciaConta.ANUAL)
  @IsInt({ message: 'Informe o mês de vencimento (1 a 12).' })
  @Min(1)
  @Max(12)
  mesVencimento?: number | null;

  @ValidateIf((o) => o.recorrencia === RecorrenciaConta.UNICA)
  @IsDateString({}, { message: 'Informe a data de vencimento da conta avulsa.' })
  dataUnica?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorPrevisto?: number | null;

  @IsOptional()
  @IsString()
  meioPagamentoId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  lembrarDiasAntes?: number;

  // Primeiro mês com ocorrência (YYYY-MM-DD); padrão: mês atual
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  observacoes?: string | null;
}

export class UpdateBillDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsString()
  categoria?: string | null;

  @IsOptional()
  @IsEnum(RecorrenciaConta)
  recorrencia?: RecorrenciaConta;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaVencimento?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mesVencimento?: number | null;

  @IsOptional()
  @IsDateString()
  dataUnica?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorPrevisto?: number | null;

  @IsOptional()
  @IsString()
  meioPagamentoId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  lembrarDiasAntes?: number;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  observacoes?: string | null;
}

export class PayBillOccurrenceDto {
  // Padrão: valor exibido da ocorrência (fatura do cartão ou valor previsto)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorPago?: number;

  // Padrão: hoje
  @IsOptional()
  @IsDateString()
  pagoEm?: string;
}
