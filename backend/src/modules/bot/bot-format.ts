import { randomBytes } from 'crypto';
import { BotButton } from './bot.types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const BotFormat = {
  brl(value: number | string | { toString(): string }): string {
    return brl.format(Number(value));
  },

  /** Escapa texto do usuário para o parse_mode HTML do Telegram. */
  esc(text: string | null | undefined): string {
    return (text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  /**
   * Converte "45,90", "45.90", "1.234,56", "R$ 12" em número.
   * Retorna null se não for um valor positivo com até 2 casas.
   */
  parseAmount(raw: string): number | null {
    let s = raw.trim().replace(/^r\$\s*/i, '').replace(/\s/g, '');
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

  /** Aceita dd/mm, dd/mm/aa, dd/mm/aaaa, "hoje" e "ontem". Retorna YYYY-MM-DD ou null. */
  parseDate(raw: string, today: string): string | null {
    const s = raw.trim().toLowerCase();
    if (s === 'hoje') return today;
    if (s === 'ontem') return BotFormat.addDays(today, -1);
    const m = /^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2}|\d{4}))?$/.exec(s);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
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

  /** YYYY-MM-DD → dd/mm/aaaa */
  date(isoDate: string | Date): string {
    const iso = typeof isoDate === 'string' ? isoDate : isoDate.toISOString();
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  },

  monthName(month: string): string {
    const [y, m] = month.split('-').map(Number);
    const name = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' });
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}/${y}`;
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
  label(text: string, max = 28): string {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  },
};
