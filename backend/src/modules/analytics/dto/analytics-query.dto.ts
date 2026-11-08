import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const ANALYTICS_BASES = ['compra', 'fatura'] as const;
export type AnalyticsBasis = (typeof ANALYTICS_BASES)[number];

export class AnalyticsQueryDto {
  @IsOptional()
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(2000)
  @Max(2100)
  year?: number;

  // compra = mês da data da compra; fatura = mês de vencimento de cada parcela
  @IsOptional()
  @IsIn(ANALYTICS_BASES, { message: "A visão deve ser 'compra' ou 'fatura'." })
  basis?: AnalyticsBasis;
}
