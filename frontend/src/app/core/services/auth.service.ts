import { Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

export interface UserAuthProfile {
  id: string;
  username: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keycloak: Keycloak | null = null;
  private readonly config = environment.keycloak;

  // Signals reativos para o estado do usuário
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly currentUser = signal<UserAuthProfile | null>(null);

  constructor() {
    this.keycloak = new Keycloak({
      url: this.config.url,
      realm: this.config.realm,
      clientId: this.config.clientId,
    });
  }

  /**
   * Inicializa o cliente Keycloak no ciclo de vida da aplicação
   */
  async init(): Promise<boolean> {
    if (!this.keycloak) {
      return false;
    }

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      });

      this.isAuthenticated.set(!!authenticated);

      if (authenticated) {
        this.updateUserProfile();
      }

      return authenticated;
    } catch (error) {
      console.warn('Falha na inicialização do Keycloak SSO:', error);
      this.isAuthenticated.set(false);
      return false;
    }
  }

  /**
   * Redireciona para o login do Keycloak
   */
  login(redirectUri?: string): Promise<void> {
    return this.keycloak?.login({
      redirectUri: redirectUri || window.location.href,
    }) || Promise.resolve();
  }

  /**
   * Executa logout na sessão do Keycloak
   */
  logout(redirectUri?: string): Promise<void> {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    return this.keycloak?.logout({
      redirectUri: redirectUri || window.location.origin,
    }) || Promise.resolve();
  }

  /**
   * Retorna o token JWT atual
   */
  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  /**
   * Garante token válido e renova caso expire em menos de 30 segundos
   */
  async getValidToken(): Promise<string | undefined> {
    if (!this.keycloak) return undefined;

    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token;
    } catch {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
      return undefined;
    }
  }

  /**
   * Retorna se o usuário está autenticado
   */
  isLoggedIn(): boolean {
    return !!this.keycloak?.authenticated;
  }

  /**
   * Verifica se o usuário possui determinada role (com ou sem prefixo ROLE_)
   */
  hasRole(role: string): boolean {
    const roles = this.currentUser()?.roles || [];
    const normalizedTarget = role.toUpperCase();
    return roles.some((r) => {
      const normalizedR = r.toUpperCase();
      return (
        normalizedR === normalizedTarget ||
        normalizedR === `ROLE_${normalizedTarget}` ||
        `ROLE_${normalizedR}` === normalizedTarget
      );
    });
  }

  /**
   * Extrai e atualiza perfil do usuário baseado no token
   */
  private updateUserProfile(): void {
    if (!this.keycloak?.tokenParsed) return;

    const claims = this.keycloak.tokenParsed;
    const realmAccess = claims['realm_access'] as { roles?: string[] } | undefined;
    const roles = Array.isArray(realmAccess?.roles) ? realmAccess.roles : [];

    const fn = (claims['given_name'] as string) || '';
    const ln = (claims['family_name'] as string) || '';
    const fullName = (claims['name'] as string) || `${fn} ${ln}`.trim() || (claims['preferred_username'] as string);

    this.currentUser.set({
      id: claims.sub || '',
      username: (claims['preferred_username'] as string) || '',
      email: claims['email'] as string,
      name: fullName,
      firstName: fn,
      lastName: ln,
      roles,
    });
  }
}
