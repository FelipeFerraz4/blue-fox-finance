import { AsyncLocalStorage } from 'async_hooks';
import { DEFAULT_LANGUAGE, DEFAULT_REGION, Language, REGIONS, Region, isLanguage } from '../constants/locale';

export interface LocaleContext {
  lang: Language;
  region: Region;
}

/**
 * Idioma e país em uso durante o atendimento de uma mensagem do bot (ou requisição),
 * sem precisar passar o usuário para cada função de formatação/tradução.
 * Fora de um `runWithLocale`, vale o padrão (pt / BR).
 */
const storage = new AsyncLocalStorage<LocaleContext>();

export function runWithLocale<T>(ctx: LocaleContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function currentLocale(): LocaleContext {
  return storage.getStore() ?? { lang: DEFAULT_LANGUAGE, region: DEFAULT_REGION };
}

export function regionInfo(region: Region = currentLocale().region) {
  return REGIONS[region];
}

/** Idioma do header Accept-Language ("en-US,en;q=0.9" → en); sem suporte, o padrão. */
export function languageFromHeader(header: string | string[] | undefined): Language {
  const value = Array.isArray(header) ? header[0] : header;
  const first = (value ?? '').split(',')[0]?.trim().slice(0, 2).toLowerCase();
  return isLanguage(first) ? first : DEFAULT_LANGUAGE;
}
