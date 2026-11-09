import { RecorrenciaConta } from '@prisma/client';

export type BillStatus = 'PAGA' | 'ATRASADA' | 'VENCE_HOJE' | 'PROXIMA' | 'PENDENTE';

export interface BillScheduleRule {
  recorrencia: RecorrenciaConta;
  diaVencimento: number | null;
  mesVencimento: number | null;
  dataUnica: Date | null;
}

/** Fuso usado para decidir "hoje": a VPS roda em UTC, o usuário está no Brasil. */
const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class BillScheduleHelper {
  /** Mês atual (YYYY-MM) no fuso da aplicação. */
  static currentMonth(): string {
    return this.today().slice(0, 7);
  }

  /** Data de hoje (YYYY-MM-DD) no fuso da aplicação. */
  static today(): string {
    // en-CA formata como YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: APP_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  static isValidMonth(month?: string): month is string {
    return !!month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  }

  static monthOf(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  static addMonths(month: string, delta: number): string {
    const [y, m] = month.split('-').map(Number);
    return this.monthOf(new Date(y, m - 1 + delta, 1));
  }

  /** Lista os meses de `from` até `to` (inclusive). */
  static monthRange(from: string, to: string): string[] {
    const months: string[] = [];
    for (let m = from; m <= to; m = this.addMonths(m, 1)) {
      months.push(m);
    }
    return months;
  }

  /**
   * Data de vencimento da conta no mês informado, ou null se ela não vence nesse mês.
   * Dia maior que o tamanho do mês vira o último dia (31 → 28/30). Usa 12:00 para evitar
   * troca de dia por fuso, como o InvoiceCalculatorHelper.
   */
  static dueDateFor(rule: BillScheduleRule, month: string): Date | null {
    const [year, m] = month.split('-').map(Number);

    switch (rule.recorrencia) {
      case RecorrenciaConta.MENSAL:
        return rule.diaVencimento ? this.clampedDate(year, m, rule.diaVencimento) : null;
      case RecorrenciaConta.ANUAL:
        return rule.diaVencimento && rule.mesVencimento === m
          ? this.clampedDate(year, m, rule.diaVencimento)
          : null;
      case RecorrenciaConta.UNICA: {
        if (!rule.dataUnica) return null;
        const d = new Date(rule.dataUnica);
        const unicaMonth = d.toISOString().slice(0, 7);
        return unicaMonth === month ? this.clampedDate(year, m, d.getUTCDate()) : null;
      }
      default:
        return null;
    }
  }

  /** Dias entre hoje e o vencimento (negativo = atrasada). */
  static daysUntil(dueDate: Date, today: string = this.today()): number {
    const due = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const [y, m, d] = today.split('-').map(Number);
    return Math.round((due - Date.UTC(y, m - 1, d)) / MS_PER_DAY);
  }

  static statusOf(
    occurrence: { pagoEm: Date | null; dataVencimento: Date },
    lembrarDiasAntes: number,
    today: string = this.today(),
  ): BillStatus {
    if (occurrence.pagoEm) return 'PAGA';
    const days = this.daysUntil(occurrence.dataVencimento, today);
    if (days < 0) return 'ATRASADA';
    if (days === 0) return 'VENCE_HOJE';
    if (days <= lembrarDiasAntes) return 'PROXIMA';
    return 'PENDENTE';
  }

  private static clampedDate(year: number, month: number, day: number): Date {
    const lastDay = new Date(year, month, 0).getDate();
    return new Date(year, month - 1, Math.min(day, lastDay), 12, 0, 0);
  }
}
