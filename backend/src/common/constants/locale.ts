/**
 * Idiomas e países/regiões suportados. Espelho de `frontend/src/app/core/i18n/locale.ts`:
 * o idioma escolhe os textos; o país define moeda e formato de data e número (Intl).
 * A moeda é só de exibição: os valores não são convertidos.
 */
export const LANGUAGES = ['pt', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface RegionInfo {
  /** Locale BCP 47 para Intl (datas e números) */
  locale: string;
  currency: string;
}

export const REGIONS = {
  BR: { locale: 'pt-BR', currency: 'BRL' },
  PT: { locale: 'pt-PT', currency: 'EUR' },
  US: { locale: 'en-US', currency: 'USD' },
  GB: { locale: 'en-GB', currency: 'GBP' },
  CA: { locale: 'en-CA', currency: 'CAD' },
  AU: { locale: 'en-AU', currency: 'AUD' },
  IE: { locale: 'en-IE', currency: 'EUR' },
  ES: { locale: 'es-ES', currency: 'EUR' },
  MX: { locale: 'es-MX', currency: 'MXN' },
} satisfies Record<string, RegionInfo>;

export type Region = keyof typeof REGIONS;
export const REGION_CODES = Object.keys(REGIONS) as Region[];

export const DEFAULT_LANGUAGE: Language = 'pt';
export const DEFAULT_REGION: Region = 'BR';

export const isLanguage = (v: unknown): v is Language => LANGUAGES.includes(v as Language);
export const isRegion = (v: unknown): v is Region => typeof v === 'string' && v in REGIONS;
