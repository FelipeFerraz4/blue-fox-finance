import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { languageFromHeader } from './locale-context';
import { translateMessage } from './translate';

/**
 * Traduz as mensagens de erro da API pelo `Accept-Language` (o site manda o idioma do
 * usuário). As mensagens continuam em português no código; o resto do tratamento é o
 * padrão do Nest.
 */
@Catch(HttpException)
export class I18nExceptionFilter extends BaseExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const req = http.getRequest<{ headers?: Record<string, string | string[] | undefined> }>();
    const lang = languageFromHeader(req?.headers?.['accept-language']);
    if (lang === 'pt') return super.catch(exception, host);

    const body = exception.getResponse();
    if (typeof body === 'string') {
      return super.catch(new HttpException(translateMessage(body, lang), exception.getStatus()), host);
    }
    const message = (body as { message?: unknown }).message;
    const translated = Array.isArray(message)
      ? message.map((m) => (typeof m === 'string' ? translateMessage(m, lang) : m))
      : typeof message === 'string'
        ? translateMessage(message, lang)
        : message;
    return super.catch(new HttpException({ ...(body as object), message: translated }, exception.getStatus()), host);
  }
}
