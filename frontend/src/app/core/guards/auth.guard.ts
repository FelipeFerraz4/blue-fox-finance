import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Verificação opcional de roles se especificada em route.data
    const requiredRoles = route.data?.['roles'] as string[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
      const hasPermission = requiredRoles.some((role) => authService.hasRole(role));
      if (!hasPermission) {
        console.warn('Usuário autenticado mas sem papel necessário:', requiredRoles);
        router.navigate(['/home']);
        return false;
      }
    }
    return true;
  }

  // Redireciona para o login do Keycloak passando o destino original
  const returnUrl = window.location.origin + state.url;
  authService.login(returnUrl);
  return false;
};
