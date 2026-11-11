import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NEW_USER_ROLES } from '../auth/roles.constants';
import { KeycloakAdminService } from './keycloak-admin.service';
import { CreateUserDto } from './dto/create-user.dto';

const USER_SELECT = {
  id: true,
  keycloakId: true,
  username: true,
  email: true,
  nome: true,
  sobrenome: true,
  createdAt: true,
} satisfies Prisma.UsuarioSelect;

/** Criação de usuários pela tela de administração: Keycloak + registro no banco. */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
  ) {}

  get configured() {
    return this.keycloak.configured;
  }

  findAll() {
    return this.prisma.usuario.findMany({ select: USER_SELECT, orderBy: { createdAt: 'desc' } });
  }

  /**
   * Cria no Keycloak (papéis fixos NEW_USER_ROLES, nunca vindos do cliente)
   * e registra no banco. Se o registro falhar, apaga a conta do Keycloak.
   */
  async create(adminId: string, dto: CreateUserDto) {
    // O login é sempre o e-mail
    const username = dto.email;

    const keycloakId = await this.keycloak.createUser(
      {
        username,
        email: dto.email,
        firstName: dto.nome,
        lastName: dto.sobrenome,
        temporaryPassword: dto.senhaTemporaria,
      },
      [...NEW_USER_ROLES],
    );

    try {
      const user = await this.prisma.usuario.create({
        data: {
          keycloakId,
          username,
          email: dto.email,
          nome: dto.nome,
          sobrenome: dto.sobrenome || null,
          criadoPor: adminId,
        },
        select: USER_SELECT,
      });
      this.logger.log(`Usuário ${keycloakId} criado pelo admin ${adminId}`);
      return user;
    } catch (err) {
      await this.keycloak
        .deleteUser(keycloakId)
        .catch((e) => this.logger.error(`Falha ao desfazer usuário ${keycloakId}: ${(e as Error).message}`));
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Já existe um usuário com este e-mail.');
      }
      throw err;
    }
  }
}
