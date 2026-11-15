import { RenderMode, ServerRoute } from '@angular/ssr';
import { LANGUAGES } from './core/services/translation/translation.service';

/**
 * Prerender (outputMode 'static'): só as páginas públicas viram HTML pronto no build
 * (dist/.../browser/pt/index.html, en/about/index.html...). O resto (sistema interno,
 * redirecionamentos e 404) roda só no navegador a partir do index.csr.html, servido
 * pelo nginx; não há servidor Node em produção.
 */
const PUBLIC_PATHS = LANGUAGES.flatMap((lang) => [lang, `${lang}/about`, `${lang}/updates`]);

export const serverRoutes: ServerRoute[] = [
  ...PUBLIC_PATHS.map((path): ServerRoute => ({ path, renderMode: RenderMode.Prerender })),
  { path: '**', renderMode: RenderMode.Client },
];
