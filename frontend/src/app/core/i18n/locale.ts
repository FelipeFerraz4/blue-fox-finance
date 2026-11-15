/**
 * Idiomas e países/regiões suportados (espelho de `backend/src/common/constants/locale.ts`).
 * O idioma escolhe os textos; o país define moeda e formato de data e número.
 * A moeda é só de exibição: os valores não são convertidos.
 */
export const LANGUAGES = ['pt', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface RegionInfo {
  /** Locale BCP 47 para Intl (números e datas numéricas) */
  locale: string;
  currency: string;
  /** Nome do país em cada idioma */
  name: Record<Language, string>;
  flag: string;
}

export const REGIONS = {
  BR: { locale: 'pt-BR', currency: 'BRL', flag: '🇧🇷', name: { pt: 'Brasil', en: 'Brazil' } },
  PT: { locale: 'pt-PT', currency: 'EUR', flag: '🇵🇹', name: { pt: 'Portugal', en: 'Portugal' } },
  US: { locale: 'en-US', currency: 'USD', flag: '🇺🇸', name: { pt: 'Estados Unidos', en: 'United States' } },
  GB: { locale: 'en-GB', currency: 'GBP', flag: '🇬🇧', name: { pt: 'Reino Unido', en: 'United Kingdom' } },
  CA: { locale: 'en-CA', currency: 'CAD', flag: '🇨🇦', name: { pt: 'Canadá', en: 'Canada' } },
  AU: { locale: 'en-AU', currency: 'AUD', flag: '🇦🇺', name: { pt: 'Austrália', en: 'Australia' } },
  IE: { locale: 'en-IE', currency: 'EUR', flag: '🇮🇪', name: { pt: 'Irlanda', en: 'Ireland' } },
  ES: { locale: 'es-ES', currency: 'EUR', flag: '🇪🇸', name: { pt: 'Espanha', en: 'Spain' } },
  MX: { locale: 'es-MX', currency: 'MXN', flag: '🇲🇽', name: { pt: 'México', en: 'Mexico' } },
} satisfies Record<string, RegionInfo>;

export type Region = keyof typeof REGIONS;
export const REGION_CODES = Object.keys(REGIONS) as Region[];

export const LANGUAGE_NAMES: Record<Language, string> = { pt: 'Português', en: 'English' };

export const LANG_STORAGE_KEY = 'bf-lang';
export const REGION_STORAGE_KEY = 'bf-region';

export const isLanguage = (v: unknown): v is Language => LANGUAGES.includes(v as Language);
export const isRegion = (v: unknown): v is Region => typeof v === 'string' && v in REGIONS;
