import { Pipe, PipeTransform } from '@angular/core';
import { t } from './i18n';
import { DatePreset, formatDate, formatMoney, formatNumber, formatPercent } from './format';

/**
 * {{ 'Texto em português' | t }} ou {{ '{n} itens' | t: { n: total } }}.
 * Impuro de propósito: o idioma em uso muda ao navegar entre as páginas públicas
 * (idioma da URL) e o sistema interno (idioma preferido); a busca é um Map, barata.
 */
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  transform(key: string | null | undefined, params?: Record<string, string | number | null | undefined>): string {
    return key ? t(key, params) : '';
  }
}

/** {{ valor | money }}: moeda do país escolhido. */
@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(value: unknown, decimals = 2): string {
    return value === null || value === undefined || value === '' ? '' : formatMoney(value, decimals);
  }
}

/** {{ data | appDate }} / {{ data | appDate: 'monthYear' }}; UTC por padrão (datas de compra). */
@Pipe({ name: 'appDate', standalone: true })
export class AppDatePipe implements PipeTransform {
  transform(value: unknown, preset: DatePreset = 'short', utc = true): string {
    return formatDate(value, preset, utc);
  }
}

/** {{ n | appNumber: 0 : 3 }} */
@Pipe({ name: 'appNumber', standalone: true })
export class AppNumberPipe implements PipeTransform {
  transform(value: unknown, minDecimals = 0, maxDecimals = 2): string {
    return value === null || value === undefined || value === '' ? '' : formatNumber(value, minDecimals, maxDecimals);
  }
}

/** {{ 0.256 | appPercent: 1 }} → 25,6% / 25.6% */
@Pipe({ name: 'appPercent', standalone: true })
export class AppPercentPipe implements PipeTransform {
  transform(value: unknown, maxDecimals = 0): string {
    return value === null || value === undefined || value === '' ? '' : formatPercent(value, maxDecimals);
  }
}

/** Tudo de i18n para o `imports` de um componente. */
export const I18N = [TranslatePipe, MoneyPipe, AppDatePipe, AppNumberPipe, AppPercentPipe] as const;
