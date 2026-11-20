import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.init();

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
  await authService.login(returnUrl);
  return false;
};
