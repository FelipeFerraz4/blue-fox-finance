import {
  ApplicationConfig,
  APP_INITIALIZER,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withNavigationErrorHandler((err) => {
        // Se um chunk lazy antigo falhar após deploy, recarrega automaticamente uma única vez
        if (typeof window !== 'undefined') {
          const msg = String((err as { error?: unknown })?.error ?? err ?? '');
          if (/ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(msg)) {
            const key = 'bf_chunk_reload';
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, '1');
              window.location.reload();
            }
          }
        }
      }),
    ),
    provideHttpClient(withFetch(), withInterceptors([languageInterceptor, authInterceptor])),
    // Páginas públicas chegam prontas do prerender; o navegador reaproveita o HTML
    provideClientHydration(withEventReplay()),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.init(),
      deps: [AuthService],
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
