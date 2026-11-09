import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export class CreateUserDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nome: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sobrenome?: string;

  @Transform(lower)
  @IsEmail()
  @MaxLength(254)
  email: string;

  // Padrão: o próprio e-mail (o Keycloak guarda o username em minúsculas)
  @Transform(lower)
  @IsOptional()
  @Matches(/^[a-z0-9._-]{3,50}$/, { message: 'username must have 3-50 chars: a-z, 0-9, ".", "_" or "-"' })
  username?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  senhaTemporaria: string;
}
