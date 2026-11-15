import { IsIn, IsOptional } from 'class-validator';
import { LANGUAGES, REGION_CODES } from '../../../common/constants/locale';

/** Idioma da interface e país/região (moeda e formato de data e número). */
export class UpdateLocalePreferenceDto {
  @IsOptional()
  @IsIn(LANGUAGES as readonly string[])
  idioma?: string;

  @IsOptional()
  @IsIn(REGION_CODES as readonly string[])
  regiao?: string;
}
