import { Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { isBrowserEnv } from '../../utils/browser-storage';
import { PREFERRED_LANGUAGE, languageTag } from '../../i18n/i18n';
import { environment } from '../../../../environments/environment';

export interface UserAuthProfile {
  id: string;
  username: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

const SESSION_TOKEN_KEY = 'bf_kc_token';
const SESSION_REFRESH_KEY = 'bf_kc_refresh_token';
const SESSION_ID_TOKEN_KEY = 'bf_kc_id_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keycloak: Keycloak | null = null;
  private readonly config = environment.keycloak;
  private initPromise: Promise<boolean> | null = null;

  // Signals reativos para o estado do usuário
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly currentUser = signal<UserAuthProfile | null>(null);

  constructor() {
    // Prerender das páginas públicas: sem navegador não há sessão nem Keycloak
    if (!isBrowserEnv()) return;
    this.keycloak = new Keycloak({
      url: this.config.url,
      realm: this.config.realm,
      clientId: this.config.clientId,
    });
  }

  /**
   * Inicializa o cliente Keycloak no ciclo de vida da aplicação sem bloquear
   * páginas públicas com redirecionamentos de check-sso.
   */
  async init(): Promise<boolean> {
    if (!this.keycloak) {
      return false;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInit();
    return this.initPromise;
  }

  private async performInit(): Promise<boolean> {
    if (!this.keycloak) {
      return false;
    }

    try {
      const savedToken = this.readSession(SESSION_TOKEN_KEY);
      const savedRefresh = this.readSession(SESSION_REFRESH_KEY);
      const savedIdToken = this.readSession(SESSION_ID_TOKEN_KEY);

      this.keycloak.onTokenExpired = () => {
        void this.getValidToken();
      };

      // Não usa onLoad: 'check-sso' no bootstrap para evitar redirecionamento de janela
      // inteira (que deixa a tela azul vazia no primeiro acesso). Processa callbacks OAuth
      // quando o usuário retorna do login ou restaura os tokens salvos na sessão.
      const initCall = this.keycloak.init({
        checkLoginIframe: false,
        ...(savedToken && savedRefresh
          ? {
              token: savedToken,
              refreshToken: savedRefresh,
              idToken: savedIdToken || undefined,
            }
          : {}),
      });

      const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 6000));
      const authenticated = await Promise.race([initCall, timeout]);

      this.isAuthenticated.set(!!authenticated);

      if (authenticated) {
        this.persistSessionTokens();
        this.updateUserProfile();
      } else {
        this.clearSessionTokens();
      }

      return !!authenticated;
    } catch (error) {
      console.warn('Falha na inicialização do Keycloak SSO:', error);
      this.clearSessionTokens();
      this.isAuthenticated.set(false);
      return false;
    }
  }

  /**
   * Redireciona para o login do Keycloak
   */
  async login(redirectUri?: string): Promise<void> {
    if (!this.keycloak) return;
    await this.init();
    return this.keycloak.login({
      redirectUri: redirectUri || window.location.href,
      // Tela de login do Keycloak no idioma do usuário
      locale: languageTag(PREFERRED_LANGUAGE),
    });
  }

  /**
   * Executa logout na sessão do Keycloak
   */
  logout(redirectUri?: string): Promise<void> {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.clearSessionTokens();
    return (
      this.keycloak?.logout({
        redirectUri: redirectUri || window.location.origin,
      }) || Promise.resolve()
    );
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
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        this.persistSessionTokens();
      }
      return this.keycloak.token;
    } catch {
      this.clearSessionTokens();
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

  private persistSessionTokens(): void {
    try {
      if (typeof sessionStorage === 'undefined' || !this.keycloak) return;
      if (this.keycloak.token) sessionStorage.setItem(SESSION_TOKEN_KEY, this.keycloak.token);
      if (this.keycloak.refreshToken) sessionStorage.setItem(SESSION_REFRESH_KEY, this.keycloak.refreshToken);
      if (this.keycloak.idToken) sessionStorage.setItem(SESSION_ID_TOKEN_KEY, this.keycloak.idToken);
    } catch {
      /* sessionStorage indisponível */
    }
  }

  private clearSessionTokens(): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_REFRESH_KEY);
      sessionStorage.removeItem(SESSION_ID_TOKEN_KEY);
    } catch {
      /* sessionStorage indisponível */
    }
  }

  private readSession(key: string): string | null {
    try {
      return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key);
    } catch {
      return null;
    }
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
