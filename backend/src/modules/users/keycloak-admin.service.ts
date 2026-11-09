import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NewKeycloakUser {
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  temporaryPassword: string;
}

/**
 * Cliente mínimo da Admin REST API do Keycloak, autenticado com a service account
 * do client confidencial do backend (client_credentials).
 * A service account precisa dos papéis realm-management `manage-users` e `view-users`.
 */
@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private token: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  get configured(): boolean {
    return !!this.clientId && !!this.clientSecret && !!this.urls;
  }

  /**
   * Cria o usuário com senha temporária (troca obrigatória no primeiro login)
   * e atribui os papéis de realm. Se atribuir os papéis falhar, apaga o usuário
   * criado para não deixar conta pela metade. Retorna o id (sub) do Keycloak.
   */
  async createUser(user: NewKeycloakUser, realmRoles: string[]): Promise<string> {
    const res = await this.request('POST', '/users', {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      enabled: true,
      emailVerified: false,
      requiredActions: ['UPDATE_PASSWORD'],
      credentials: [{ type: 'password', value: user.temporaryPassword, temporary: true }],
    });

    if (res.status === 409) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }
    if (res.status === 400) {
      // Ex.: senha fora da política do realm
      const body = (await res.json().catch(() => ({}))) as { errorMessage?: string; error_description?: string };
      throw new BadRequestException(body.errorMessage ?? body.error_description ?? 'Dados recusados pelo Keycloak.');
    }
    await this.ensureOk(res, 'criar usuário');

    // O id vem no header Location: .../users/<id>
    const id = res.headers.get('location')?.split('/').pop();
    if (!id) throw new ServiceUnavailableException('O Keycloak não devolveu o id do usuário criado.');

    try {
      await this.assignRealmRoles(id, realmRoles);
    } catch (err) {
      await this.deleteUser(id).catch((e) => this.logger.error(`Falha ao desfazer usuário ${id}: ${(e as Error).message}`));
      throw err;
    }
    return id;
  }

  async deleteUser(id: string): Promise<void> {
    const res = await this.request('DELETE', `/users/${encodeURIComponent(id)}`);
    if (res.status !== 404) await this.ensureOk(res, 'apagar usuário');
  }

  /**
   * Usa a lista de papéis "disponíveis para o usuário" (exige só view-users),
   * em vez de /roles/{nome}, que exigiria view-realm.
   */
  private async assignRealmRoles(userId: string, names: string[]) {
    const path = `/users/${encodeURIComponent(userId)}/role-mappings/realm`;
    const availableRes = await this.request('GET', `${path}/available`);
    await this.ensureOk(availableRes, 'listar papéis');
    const available = (await availableRes.json()) as { id: string; name: string }[];

    const roles = names.map((name) => available.find((r) => r.name === name));
    const missing = names.filter((_, i) => !roles[i]);
    if (missing.length) {
      throw new ServiceUnavailableException(`Papéis não encontrados no Keycloak: ${missing.join(', ')}`);
    }
    const res = await this.request('POST', path, roles.map((r) => ({ id: r!.id, name: r!.name })));
    await this.ensureOk(res, 'atribuir papéis');
  }

  // ---------------------------------------------------------------------------
  // HTTP
  // ---------------------------------------------------------------------------

  private async request(method: string, path: string, body?: unknown, retry = true): Promise<Response> {
    const urls = this.requireConfig();
    const res = await fetch(`${urls.admin}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${await this.accessToken()}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 && retry) {
      // Token expirado ou revogado: renova uma vez
      this.token = null;
      return this.request(method, path, body, false);
    }
    return res;
  }

  private async accessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) return this.token.value;
    const urls = this.requireConfig();
    const res = await fetch(urls.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId!,
        client_secret: this.clientSecret!,
      }),
    });
    if (!res.ok) {
      this.logger.error(`Keycloak recusou o client_credentials (${res.status}): ${await res.text()}`);
      throw new ServiceUnavailableException('Não foi possível autenticar o backend no Keycloak.');
    }
    const json = (await res.json()) as { access_token: string; expires_in: number };
    // Renova 30s antes de expirar
    this.token = { value: json.access_token, expiresAt: Date.now() + (json.expires_in - 30) * 1000 };
    return json.access_token;
  }

  private async ensureOk(res: Response, action: string) {
    if (res.ok) return;
    const detail = await res.text().catch(() => '');
    this.logger.error(`Keycloak falhou ao ${action} (${res.status}): ${detail}`);
    if (res.status === 403) {
      throw new ServiceUnavailableException(
        'O backend não tem permissão para gerenciar usuários no Keycloak (manage-users / view-users).',
      );
    }
    throw new ServiceUnavailableException(`O Keycloak falhou ao ${action}.`);
  }

  private requireConfig() {
    const urls = this.urls;
    if (!this.clientId || !this.clientSecret || !urls) {
      throw new ServiceUnavailableException(
        'Criação de usuários não configurada (KEYCLOAK_ADMIN_CLIENT_ID / KEYCLOAK_ADMIN_CLIENT_SECRET).',
      );
    }
    return urls;
  }

  private get clientId() {
    return this.config.get<string>('KEYCLOAK_ADMIN_CLIENT_ID');
  }

  private get clientSecret() {
    return this.config.get<string>('KEYCLOAK_ADMIN_CLIENT_SECRET');
  }

  /** Deriva as URLs do issuer: http://host/auth/realms/<realm> → /auth/admin/realms/<realm>. */
  private get urls(): { token: string; admin: string } | null {
    const issuer = this.config.get<string>('KEYCLOAK_ISSUER_URI', '').replace(/\/$/, '');
    const match = /^(.*)\/realms\/([^/]+)$/.exec(issuer);
    if (!match) return null;
    const [, base, realm] = match;
    return {
      token: `${issuer}/protocol/openid-connect/token`,
      admin: `${base}/admin/realms/${realm}`,
    };
  }
}
