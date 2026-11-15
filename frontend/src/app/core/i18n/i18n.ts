import { signal } from '@angular/core';
import { storageGet, storageSet } from '../utils/browser-storage';
import { EN } from './en';
import {
  LANG_STORAGE_KEY,
  Language,
  REGIONS,
  REGION_STORAGE_KEY,
  Region,
  RegionInfo,
  isLanguage,
  isRegion,
} from './locale';

/**
 * Tradução do sistema interno. A chave é o próprio texto em português e o inglês
 * fica em `en.ts` (PT → EN); texto sem tradução aparece em português, nunca como
 * chave quebrada. Parâmetros no formato `{nome}`: t('{n} itens', { n: 3 }).
 *
 * - Idioma preferido (`bf-lang`, também escolhido no seletor das páginas públicas) e
 *   país (`bf-region`) são lidos uma vez, ao carregar. Trocar no perfil salva e recarrega.
 * - `activeLanguage` é o idioma em uso agora: nas páginas públicas, o da URL (o
 *   TranslationService ajusta); no sistema interno, o preferido.
 */
const navigatorLang = (): string => (typeof navigator === 'undefined' ? 'pt-BR' : navigator.language || 'pt-BR');

function readLanguage(): Language {
  const saved = storageGet(LANG_STORAGE_KEY);
  if (isLanguage(saved)) return saved;
  return navigatorLang().toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function readRegion(lang: Language): Region {
  const saved = storageGet(REGION_STORAGE_KEY);
  if (isRegion(saved)) return saved;
  // Sem escolha: o país do navegador (en-GB → GB), senão o padrão do idioma
  const country = navigatorLang().split('-')[1]?.toUpperCase();
  if (isRegion(country)) return country;
  return lang === 'pt' ? 'BR' : 'US';
}

/** Idioma preferido do usuário (fixo durante a visita). */
export const PREFERRED_LANGUAGE: Language = readLanguage();
/** País/região (fixo durante a visita): moeda e formatos. */
export const REGION: Region = readRegion(PREFERRED_LANGUAGE);
export const REGION_INFO: RegionInfo = REGIONS[REGION];

/** Idioma em uso agora (público: o da URL; interno: o preferido). */
export const activeLanguage = signal<Language>(PREFERRED_LANGUAGE);

const DICTIONARIES: Record<Language, Record<string, string> | null> = { pt: null, en: EN };

export function t(key: string, params?: Record<string, string | number | null | undefined>): string {
  const dict = DICTIONARIES[activeLanguage()];
  let text = (dict && dict[key]) || key;
  if (params) {
    for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value ?? ''));
  }
  return text;
}

/** Salva idioma e país (localStorage) e recarrega para tudo trocar junto. */
export function saveLocale(lang: Language, region: Region, reload = true): void {
  storageSet(LANG_STORAGE_KEY, lang);
  storageSet(REGION_STORAGE_KEY, region);
  if (reload && typeof location !== 'undefined' && (lang !== PREFERRED_LANGUAGE || region !== REGION)) location.reload();
}

/** Tag BCP 47 do idioma em uso (atributo lang, voz da leitura, Keycloak). */
export const languageTag = (lang: Language = activeLanguage()): string => (lang === 'pt' ? 'pt-BR' : 'en');
