import { Injectable } from '@nestjs/common';
import { TipoLancamento } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BillOccurrenceView, BillsService } from '../../bills/bills.service';
import { BillScheduleHelper } from '../../../common/helpers/bill-schedule.helper';
import { BotFormat as F } from '../bot-format';
import { BotButton, BotReply, BotUser } from '../bot.types';
import { BillsFlow } from './bills.flow';
import { t } from '../../../common/i18n/translate';

type FutureInstallment = {
  valor: unknown;
  mesReferencia: string;
  lancamento: { id: string; tipo: TipoLancamento; meioPagamento: { nome: string } };
};

/** Contas fixas de um mês, sem as vinculadas a cartão (o valor delas são as parcelas, já somadas). */
type MonthBills = { items: BillOccurrenceView[]; total: number; variable: number };

const MAX_LISTED_BILLS = 6;
const MAX_AMOUNT_BUTTONS = 6;

/**
 * `/resumo`: gastos do mês pelo mês do pagamento (mesma visão do Dashboard:
 * cada parcela conta no mês em que é paga), as contas fixas do mês e os gastos
 * futuros: próximo mês (parcelas por meio de pagamento + contas fixas), os dois
 * seguintes e o total de parcelas não pagas a partir do próximo mês.
 */
@Injectable()
export class SummaryFlow {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bills: BillsService,
  ) {}

  async summary(u: BotUser): Promise<BotReply[]> {
    const month = BillScheduleHelper.currentMonth();
    const previous = BillScheduleHelper.addMonths(month, -1);
    const next = BillScheduleHelper.addMonths(month, 1);
    const upcoming = [next, BillScheduleHelper.addMonths(next, 1), BillScheduleHelper.addMonths(next, 2)];

    const [installments, previousTotal, future, alerts] = await Promise.all([
      this.prisma.parcela.findMany({
        where: { mesReferencia: month, lancamento: { userId: u.userId } },
        select: { valor: true, lancamento: { select: { categoria: true } } },
      }),
      this.prisma.parcela.aggregate({
        where: { mesReferencia: previous, lancamento: { userId: u.userId } },
        _sum: { valor: true },
      }),
      this.prisma.parcela.findMany({
        where: { pago: false, mesReferencia: { gte: next }, lancamento: { userId: u.userId } },
        select: {
          valor: true,
          mesReferencia: true,
          lancamento: { select: { id: true, tipo: true, meioPagamento: { select: { nome: true } } } },
        },
      }),
      this.bills.getAlerts(u.userId),
    ]);
    // Depois do getAlerts, que já cria as ocorrências até o próximo mês
    const [currentBills, ...upcomingBills] = await Promise.all(
      [month, ...upcoming].map((m) => this.monthBills(u.userId, m)),
    );

    const total = installments.reduce((sum, p) => sum + Number(p.valor), 0);
    const prev = Number(previousTotal._sum.valor ?? 0);

    const byCategory = new Map<string, number>();
    for (const p of installments) {
      byCategory.set(p.lancamento.categoria, (byCategory.get(p.lancamento.categoria) ?? 0) + Number(p.valor));
    }
    const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const lines = [`📊 <b>${F.monthName(month)}</b>`, '', t('Total do mês: <b>{valor}</b>', { valor: F.brl(total) })];
    if (prev > 0) {
      const diff = ((total - prev) / prev) * 100;
      const arrow = diff >= 0 ? '▲' : '▼';
      lines.push(`${arrow} ${Math.abs(diff).toFixed(0)}% ${t('vs')} ${F.monthName(previous).toLowerCase()} (${F.brl(prev)})`);
    }
    if (top.length) {
      lines.push('', t('<b>Categorias</b>'));
      for (const [name, value] of top) {
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        lines.push(`• ${F.esc(name)}: ${F.brl(value)} (${pct}%)`);
      }
    }

    lines.push(...this.currentBillsLines(currentBills, month));
    lines.push('', ...this.futureLines(future, upcoming, upcomingBills));

    if (alerts.total > 0) {
      const overdue = alerts.atrasadas.length ? t(', {n} atrasada(s)', { n: alerts.atrasadas.length }) : '';
      lines.push('', t('🔔 {n} conta(s) precisando de atenção{atrasadas}. Veja em /contas', { n: alerts.total, atrasadas: overdue }));
    }

    const buttons = this.amountButtons(currentBills, upcomingBills[0], next);
    if (buttons.length) lines.push('', t('<i>Chegou a conta de valor variável? Toque para informar o valor do mês.</i>'));
    return [{ text: lines.join('\n'), ...(buttons.length ? { buttons } : {}) }];
  }

  private async monthBills(userId: string, month: string): Promise<MonthBills> {
    const { ocorrencias } = await this.bills.getOccurrences(userId, month);
    const items = ocorrencias.filter((o) => !o.meioPagamentoId);
    return {
      items,
      total: items.reduce((sum, o) => sum + (o.valor ?? 0), 0),
      variable: items.filter((o) => o.valor === null).length,
    };
  }

  /** Contas fixas do mês atual, uma a uma, com vencimento e situação, e os totais. */
  private currentBillsLines(bills: MonthBills, month: string): string[] {
    if (!bills.items.length) return [];
    const paid = bills.items.filter((o) => o.status === 'PAGA');
    const pending = bills.items.filter((o) => o.status !== 'PAGA');
    const sum = (list: BillOccurrenceView[]) => list.reduce((acc, o) => acc + (o.valor ?? 0), 0);

    const lines = ['', t('🧾 <b>Contas fixas de {mes}</b>', { mes: F.monthName(month).toLowerCase() })];
    for (const o of bills.items) {
      const value = o.valor === null ? t('valor a informar') : F.brl(o.valor);
      lines.push(`${this.billIcon(o)} ${F.esc(o.nome)} · ${F.dayMonth(o.dataVencimento)} · ${value} · ${this.billStatus(o)}`);
    }
    const variable = pending.filter((o) => o.valor === null).length;
    const note = variable ? t(' ({n} sem valor)', { n: variable }) : '';
    lines.push(t('Pago: {pago} · Falta: <b>{falta}</b>{nota}', { pago: F.brl(sum(paid)), falta: F.brl(sum(pending)), nota: note }));
    return lines;
  }

  private billIcon(o: BillOccurrenceView): string {
    switch (o.status) {
      case 'PAGA':
        return '✅';
      case 'ATRASADA':
        return '🔴';
      case 'VENCE_HOJE':
        return '🟠';
      case 'PROXIMA':
        return '🟡';
      default:
        return '⚪';
    }
  }

  private billStatus(o: BillOccurrenceView): string {
    switch (o.status) {
      case 'PAGA':
        return o.pagoEm ? t('paga em {data}', { data: F.dayMonth(o.pagoEm) }) : t('paga');
      case 'ATRASADA':
        return t('atrasada');
      case 'VENCE_HOJE':
        return t('vence hoje');
      default:
        return t('a pagar');
    }
  }

  /** "Informar/Alterar valor" das contas variáveis pendentes do mês atual e do próximo. */
  private amountButtons(current: MonthBills, next: MonthBills, nextMonth: string): BotButton[][] {
    const shortMonth = F.monthName(nextMonth).slice(0, 3).toLowerCase();
    const candidates = [
      ...current.items.filter((o) => o.status !== 'PAGA' && o.valorVariavel).map((o) => BillsFlow.amountButton(o)),
      ...next.items.filter((o) => o.status !== 'PAGA' && o.valorVariavel).map((o) => BillsFlow.amountButton(o, ` (${shortMonth})`)),
    ];
    return candidates.slice(0, MAX_AMOUNT_BUTTONS).map((b) => [b]);
  }

  /**
   * Próximo mês (parcelas por meio de pagamento + contas fixas, uma a uma), os dois
   * meses seguintes e o total de parcelas a partir do próximo mês (ele incluído).
   */
  private futureLines(future: FutureInstallment[], months: string[], bills: MonthBills[]): string[] {
    const [next] = months;
    const byMonth = new Map<string, number>();
    const nextByMethod = new Map<string, number>();
    const openPlans = new Set<string>();
    let installmentsTotal = 0;
    let lastMonth = next;
    for (const p of future) {
      const value = Number(p.valor);
      installmentsTotal += value;
      byMonth.set(p.mesReferencia, (byMonth.get(p.mesReferencia) ?? 0) + value);
      if (p.mesReferencia === next) {
        const method = p.lancamento.meioPagamento.nome;
        nextByMethod.set(method, (nextByMethod.get(method) ?? 0) + value);
      }
      if (p.lancamento.tipo === TipoLancamento.PARCELADO) openPlans.add(p.lancamento.id);
      if (p.mesReferencia > lastMonth) lastMonth = p.mesReferencia;
    }

    if (!future.length && bills.every((b) => !b.items.length)) {
      return [t('🗓️ <b>Gastos futuros</b>'), t('Nada previsto a partir de {mes}.', { mes: F.monthName(next).toLowerCase() })];
    }

    const variableNote = (b: MonthBills) => (b.variable ? t(' · {n} de valor variável fora da soma', { n: b.variable }) : '');
    const lines = [t('🗓️ <b>Gastos futuros</b>')];

    // Próximo mês em detalhe
    const nextBills = bills[0];
    lines.push(`${F.monthName(next)}: <b>${F.brl((byMonth.get(next) ?? 0) + nextBills.total)}</b>${variableNote(nextBills)}`);
    for (const [method, value] of [...nextByMethod.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`  • ${F.esc(method)}: ${F.brl(value)}`);
    }
    if (nextBills.items.length) {
      lines.push(`  • ${t('Contas fixas: {valor} ({n})', { valor: F.brl(nextBills.total), n: nextBills.items.length })}`);
      for (const o of nextBills.items.slice(0, MAX_LISTED_BILLS)) {
        const value = o.valor === null ? t('valor variável') : F.brl(o.valor);
        lines.push(`      ◦ ${F.esc(o.nome)} (${F.dayMonth(o.dataVencimento)}): ${value}`);
      }
      const hidden = nextBills.items.length - MAX_LISTED_BILLS;
      if (hidden > 0) lines.push(`      ◦ ${t('e mais {n}', { n: hidden })}`);
    }

    // Os dois meses seguintes, só os totais
    months.slice(1).forEach((m, i) => {
      const parcelas = byMonth.get(m) ?? 0;
      const b = bills[i + 1];
      if (parcelas + b.total === 0 && !b.variable) return;
      const parts = [
        parcelas > 0 && t('parcelas {valor}', { valor: F.brl(parcelas) }),
        b.items.length && t('contas {valor}', { valor: F.brl(b.total) }),
      ].filter(Boolean);
      lines.push(`${F.monthName(m)}: ${F.brl(parcelas + b.total)} (${parts.join(' + ')})${variableNote(b)}`);
    });

    if (future.length) {
      lines.push('', t('Parcelas futuras (a partir de {mes}): <b>{valor}</b>', { mes: F.monthName(next).toLowerCase(), valor: F.brl(installmentsTotal) }));
      const plans = openPlans.size ? t('{n} parcelamento(s) em aberto, ', { n: openPlans.size }) : '';
      lines.push(t('{planos}última parcela em {mes}', { planos: plans, mes: F.monthName(lastMonth).toLowerCase() }));
    }
    return lines;
  }
}
