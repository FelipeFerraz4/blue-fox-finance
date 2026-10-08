import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Se não estiver logado, segue sem adicionar header
  if (!authService.isLoggedIn()) {
    return next(req);
  }

  // Renova o token se estiver para expirar e anexa no Header Authorization
  return from(authService.getValidToken()).pipe(
    switchMap((token) => {
      if (token) {
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(cloned);
      }
      return next(req);
    }),
  );
};
