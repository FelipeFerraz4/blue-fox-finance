import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { activeLanguage, languageTag } from '../i18n/i18n';

/** Idioma do usuário nas chamadas à API: as mensagens de erro voltam traduzidas. */
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);
  return next(req.clone({ setHeaders: { 'Accept-Language': languageTag(activeLanguage()) } }));
};
