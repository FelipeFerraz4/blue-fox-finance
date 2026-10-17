import { IsOptional, IsString } from 'class-validator';

export class UpdateExpensePreferenceDto {
  @IsOptional()
  @IsString({ message: 'O ID do comprador padrão deve ser uma string.' })
  compradorPadraoId?: string | null;

  @IsOptional()
  @IsString({ message: 'O ID da loja padrão deve ser uma string.' })
  lojaPadraoId?: string | null;

  @IsOptional()
  @IsString({ message: 'O ID do meio de pagamento padrão deve ser uma string.' })
  meioPagamentoPadraoId?: string | null;

  @IsOptional()
  @IsString({ message: 'A categoria padrão deve ser uma string.' })
  categoriaPadrao?: string | null;
}
