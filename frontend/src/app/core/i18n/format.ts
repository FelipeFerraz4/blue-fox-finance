import { REGION, REGION_INFO, activeLanguage } from './i18n';

/**
 * Formatação pelo país escolhido (Intl), no lugar do `pt-BR`/`BRL` fixos.
 * Números, moeda e datas numéricas usam o locale do país; nomes de mês e dia da
 * semana usam o idioma com o país (en-BR, pt-US...) quando o navegador conhece a
 * combinação, senão só o idioma. Datas de compra são meia-noite UTC: por padrão as
 * datas são formatadas em UTC (`utc = false` para datas e horas locais).
 */
const NUMBER_LOCALE = REGION_INFO.locale;
export const CURRENCY = REGION_INFO.currency;

const wordsLocale = (): string => {
  const combo = `${activeLanguage()}-${REGION}`;
  return Intl.DateTimeFormat.supportedLocalesOf([combo]).length ? combo : activeLanguage();
};

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
function numberFormat(key: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  let f = cache.get('n' + key) as Intl.NumberFormat | undefined;
  if (!f) cache.set('n' + key, (f = new Intl.NumberFormat(NUMBER_LOCALE, options)));
  return f;
}
function dateFormat(locale: string, key: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  let f = cache.get(`d${locale}${key}`) as Intl.DateTimeFormat | undefined;
  if (!f) cache.set(`d${locale}${key}`, (f = new Intl.DateTimeFormat(locale, options)));
  return f;
}

const toNumber = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** R$ 1.234,56 · $1,234.56 · 1 234,56 € */
export function formatMoney(value: unknown, decimals = 2): string {
  return numberFormat(`money${decimals}`, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(toNumber(value));
}

/** Moeda curta para eixos de gráfico: R$ 12 mil · $12K */
export function formatMoneyCompact(value: unknown): string {
  return numberFormat('moneyCompact', {
    style: 'currency',
    currency: CURRENCY,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

export function formatNumber(value: unknown, minDecimals = 0, maxDecimals = 2): string {
  return numberFormat(`num${minDecimals}-${maxDecimals}`, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(toNumber(value));
}

export function formatCompact(value: unknown): string {
  return numberFormat('compact', { notation: 'compact', maximumFractionDigits: 1 }).format(toNumber(value));
}

export function formatPercent(value: unknown, maxDecimals = 0): string {
  return numberFormat(`pct${maxDecimals}`, { style: 'percent', maximumFractionDigits: maxDecimals }).format(toNumber(value));
}

/** Símbolo da moeda (R$, $, €, £...) para prefixos de campos. */
export function currencySymbol(): string {
  return (
    numberFormat('symbol', { style: 'currency', currency: CURRENCY, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? CURRENCY
  );
}

/** Separador decimal do país ("," ou "."). */
export function decimalSeparator(): string {
  return numberFormat('sep', {}).formatToParts(1.5).find((p) => p.type === 'decimal')?.value ?? ',';
}

/**
 * Lê um número digitado no formato do país ("1.234,56" no Brasil, "1,234.56" nos EUA).
 * Aceita também o outro separador quando não há ambiguidade ("12.5" no Brasil = 12,5).
 */
export function parseDecimal(input: unknown): number {
  if (typeof input === 'number') return Number.isFinite(input) ? input : NaN;
  let str = String(input ?? '').trim().replace(/[^\d.,-]/g, '');
  if (!str) return NaN;
  const dec = decimalSeparator();
  const group = dec === ',' ? '.' : ',';
  if (str.includes(dec)) {
    str = str.split(group).join('').replace(dec, '.');
  } else if (str.includes(group)) {
    // Só o outro separador: "1.234" (milhar) ou "12.5" (decimal digitado no outro formato)
    const parts = str.split(group);
    const looksLikeThousands = parts.length > 2 || parts[parts.length - 1].length === 3;
    str = looksLikeThousands ? parts.join('') : parts.join('.');
  }
  const n = parseFloat(str);
  return Number.isFinite(n) ? n : NaN;
}

export type DatePreset = 'short' | 'dayMonth' | 'monthYear' | 'monthShortYear' | 'long' | 'dateTime' | 'time' | 'weekdayShort';

const DATE_PRESETS: Record<DatePreset, { words: boolean; options: Intl.DateTimeFormatOptions }> = {
  short: { words: false, options: { day: '2-digit', month: '2-digit', year: 'numeric' } },
  dayMonth: { words: false, options: { day: '2-digit', month: '2-digit' } },
  monthYear: { words: true, options: { month: 'long', year: 'numeric' } },
  monthShortYear: { words: true, options: { month: 'short', year: 'numeric' } },
  long: { words: true, options: { day: 'numeric', month: 'long', year: 'numeric' } },
  dateTime: { words: false, options: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' } },
  time: { words: false, options: { hour: '2-digit', minute: '2-digit' } },
  weekdayShort: { words: true, options: { weekday: 'short' } },
};

const toDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === '') return null;
  // "YYYY-MM-DD" sozinho = meia-noite UTC (mesmo formato gravado pela API)
  const d = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Datas pelo país: 31/12/2026 · 12/31/2026 · dezembro de 2026 · December 2026. */
export function formatDate(value: unknown, preset: DatePreset = 'short', utc = true): string {
  const d = toDate(value);
  if (!d) return '';
  const { words, options } = DATE_PRESETS[preset];
  const locale = words ? wordsLocale() : NUMBER_LOCALE;
  return dateFormat(locale, `${preset}${utc}`, { ...options, ...(utc ? { timeZone: 'UTC' } : {}) }).format(d);
}

/** Nome do mês (0 = janeiro) no idioma: "janeiro"/"January", curto "jan"/"Jan". */
export function monthName(monthIndex: number, style: 'long' | 'short' = 'long'): string {
  const d = new Date(Date.UTC(2024, monthIndex, 1));
  return dateFormat(wordsLocale(), `m${style}`, { month: style, timeZone: 'UTC' })
    .format(d)
    .replace('.', '');
}

/** Nome do mês de uma chave "YYYY-MM" com o ano: "março de 2026" / "March 2026". */
export function monthKeyLabel(key: string, style: 'long' | 'short' = 'long'): string {
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return key;
  return formatDate(new Date(Date.UTC(y, m - 1, 1)), style === 'long' ? 'monthYear' : 'monthShortYear');
}

/** Compara textos no idioma em uso (ordenação de listas). */
export const collator = (): Intl.Collator => new Intl.Collator(activeLanguage(), { sensitivity: 'base', numeric: true });
