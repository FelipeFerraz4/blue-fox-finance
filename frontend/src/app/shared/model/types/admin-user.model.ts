/** Usuário criado pela tela Admin → Usuários (registro no banco do Finance). */
export interface AdminUser {
  id: string;
  keycloakId: string;
  username: string;
  email: string;
  nome: string;
  sobrenome: string | null;
  createdAt: string;
}

/** GET /admin/users */
export interface AdminUsersResponse {
  /** false quando o backend não tem as credenciais do Keycloak configuradas */
  configured: boolean;
  /** Papéis que todo usuário criado recebe (fixos no backend) */
  roles: string[];
  users: AdminUser[];
}

export interface CreateAdminUserDto {
  nome: string;
  sobrenome?: string;
  /** Também é o login */
  email: string;
  senhaTemporaria: string;
}
