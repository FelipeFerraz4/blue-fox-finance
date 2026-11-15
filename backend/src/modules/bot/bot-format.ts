import { randomBytes } from 'crypto';
import { BotButton, BotReply } from './bot.types';
import { currentLocale, regionInfo } from '../../common/i18n/locale-context';
import { t } from '../../common/i18n/translate';

/**
 * Formatação e parsing do bot pelo idioma e país do usuário em atendimento
 * (`runWithLocale` no BotEngineService): moeda e números pelo país, nomes de mês
 * pelo idioma, ordem de dia/mês das datas pelo país (EUA: mês/dia).
 */
const numberLocale = () => regionInfo().locale;
const wordsLocale = () => {
  const { lang, region } = currentLocale();
  const combo = `${lang}-${region}`;
  return Intl.DateTimeFormat.supportedLocalesOf([combo]).length ? combo : lang;
};
/** true quando o país escreve o mês antes do dia (12/31). */
const monthFirst = () =>
  new Intl.DateTimeFormat(numberLocale(), { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
    .formatToParts(new Date(Date.UTC(2024, 11, 31)))
    .find((p) => p.type === 'month' || p.type === 'day')?.type === 'month';

export const BotFormat = {
  /** Valor na moeda do país do usuário (o nome ficou brl por histórico). */
  brl(value: number | string | { toString(): string }): string {
    return new Intl.NumberFormat(numberLocale(), { style: 'currency', currency: regionInfo().currency }).format(Number(value));
  },

  /** Escapa texto do usuário para o parse_mode HTML do Telegram. */
  esc(text: string | null | undefined): string {
    return (text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  /**
   * Converte "45,90", "45.90", "1.234,56", "1,234.56", "R$ 12", "$12" em número.
   * Retorna null se não for um valor positivo com até 2 casas.
   */
  parseAmount(raw: string): number | null {
    let s = raw.trim().replace(/^(r\$|us\$|\$|€|£)\s*/i, '').replace(/\s/g, '');
    if (!/^\d[\d.,]*$/.test(s)) return null;
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > -1 && lastComma > -1) {
      s = s.replace(/,/g, '');
    } else if (lastDot > -1 && s.length - lastDot - 1 === 3 && s.split('.').length >= 2) {
      // "1.234" = milhar
      s = s.replace(/\./g, '');
    }
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    const value = Number(s);
    return value > 0 && value <= 10_000_000 ? value : null;
  },

  /** Quantidade com até 3 casas ("1", "2,5", "0,250"). */
  parseQuantity(raw: string): number | null {
    const s = raw.trim().replace(',', '.');
    if (!/^\d+(\.\d{1,3})?$/.test(s)) return null;
    const value = Number(s);
    return value > 0 && value <= 100_000 ? value : null;
  },

  /** Mesmos nomes da tela de lançamento do site. */
  modalidade(modalidade?: string): string {
    switch (modalidade) {
      case 'CREDITO':
        return t('Crédito');
      case 'DEBITO':
        return t('Débito');
      case 'DINHEIRO_CONTA':
        return t('Conta/Dinheiro');
      default:
        return t('Outro');
    }
  },

  quantity(value: number): string {
    return value.toLocaleString(numberLocale(), { maximumFractionDigits: 3 });
  },

  /**
   * Aceita dd/mm, dd/mm/aa, dd/mm/aaaa (mm/dd nos países que escrevem o mês antes),
   * "hoje"/"today" e "ontem"/"yesterday". Retorna YYYY-MM-DD ou null.
   */
  parseDate(raw: string, today: string): string | null {
    const s = raw.trim().toLowerCase();
    if (s === 'hoje' || s === 'today') return today;
    if (s === 'ontem' || s === 'yesterday') return BotFormat.addDays(today, -1);
    const m = /^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2}|\d{4}))?$/.exec(s);
    if (!m) return null;
    const [first, second] = [Number(m[1]), Number(m[2])];
    const [day, month] = monthFirst() ? [second, first] : [first, second];
    let year = m[3] ? Number(m[3]) : Number(today.slice(0, 4));
    if (year < 100) year += 2000;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return date.toISOString().slice(0, 10);
  },

  addDays(isoDate: string, days: number): string {
    const d = new Date(`${isoDate}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  },

  /** YYYY-MM-DD → data no formato do país (31/12/2026, 12/31/2026) */
  date(isoDate: string | Date): string {
    const iso = typeof isoDate === 'string' ? isoDate : isoDate.toISOString();
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return new Intl.DateTimeFormat(numberLocale(), { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(Date.UTC(y, m - 1, d)),
    );
  },

  /** Vencimento de conta (Date às 12:00 do horário local) → dia/mês na ordem do país */
  dayMonth(date: Date | string): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(numberLocale(), { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(
      new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())),
    );
  },

  /** "2026-03" → "Março/2026" / "March/2026" (idioma do usuário) */
  monthName(month: string): string {
    const [y, m] = month.split('-').map(Number);
    const name = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(wordsLocale(), { month: 'long', timeZone: 'UTC' });
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}/${y}`;
  },

  /** Padrão de data para as dicas: "dd/mm" ou "mm/dd" (EUA); com ano, "dd/mm/aaaa" ou "dd/mm/yyyy" (inglês). */
  datePattern(withYear = false): string {
    const dm = monthFirst() ? 'mm/dd' : 'dd/mm';
    if (!withYear) return dm;
    return `${dm}/${currentLocale().lang === 'pt' ? 'aaaa' : 'yyyy'}`;
  },

  /** Símbolo da moeda do país (R$, $, €, £...). */
  currencySymbol(): string {
    const info = regionInfo();
    return (
      new Intl.NumberFormat(numberLocale(), { style: 'currency', currency: info.currency, currencyDisplay: 'narrowSymbol' })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? info.currency
    );
  },

  /** Exemplo de valor no formato do país: "120,50" / "120.50" (dicas das perguntas). */
  amountExample(value = 120.5): string {
    return value.toLocaleString(numberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  /** Exemplo de data no formato do país (dicas das perguntas). */
  dateExample(): string {
    return monthFirst() ? '12/31' : '31/12';
  },

  nonce(): string {
    return randomBytes(4).toString('hex');
  },

  /** Quebra botões em linhas de `perRow`. */
  rows(buttons: BotButton[], perRow: number): BotButton[][] {
    const rows: BotButton[][] = [];
    for (let i = 0; i < buttons.length; i += perRow) rows.push(buttons.slice(i, i + perRow));
    return rows;
  },

  /** Limita rótulos de botão (o Telegram corta textos longos de forma feia). */
  /** Acrescenta uma linha de abertura (nome da operação) acima da primeira pergunta. */
  withIntro(replies: BotReply[], intro: string): BotReply[] {
    const last = replies[replies.length - 1];
    if (!last) return replies;
    return [...replies.slice(0, -1), { ...last, text: `${intro}\n\n${last.text}` }];
  },

  label(text: string, max = 28): string {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  },
};
