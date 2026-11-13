import { Injectable } from '@nestjs/common';
import { TipoLancamento } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BillsService } from '../../bills/bills.service';
import { BillScheduleHelper } from '../../../common/helpers/bill-schedule.helper';
import { BotFormat as F } from '../bot-format';
import { BotReply, BotUser } from '../bot.types';

/**
 * `/resumo`: gastos do mês pelo mês do pagamento (mesma visão do Dashboard:
 * cada parcela conta no mês em que é paga) e os gastos futuros já assumidos
 * (parcelas não pagas a partir do próximo mês, como em "Compromissos futuros").
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

    const total = installments.reduce((sum, p) => sum + Number(p.valor), 0);
    const prev = Number(previousTotal._sum.valor ?? 0);

    const byCategory = new Map<string, number>();
    for (const p of installments) {
      byCategory.set(p.lancamento.categoria, (byCategory.get(p.lancamento.categoria) ?? 0) + Number(p.valor));
    }
    const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const lines = [`📊 <b>${F.monthName(month)}</b>`, '', `Total do mês: <b>${F.brl(total)}</b>`];
    if (prev > 0) {
      const diff = ((total - prev) / prev) * 100;
      const arrow = diff >= 0 ? '▲' : '▼';
      lines.push(`${arrow} ${Math.abs(diff).toFixed(0)}% vs ${F.monthName(previous).toLowerCase()} (${F.brl(prev)})`);
    }
    if (top.length) {
      lines.push('', '<b>Categorias</b>');
      for (const [name, value] of top) {
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        lines.push(`• ${F.esc(name)}: ${F.brl(value)} (${pct}%)`);
      }
    }
    lines.push('', ...this.futureLines(future, next));

    if (alerts.total > 0) {
      const overdue = alerts.atrasadas.length ? `, ${alerts.atrasadas.length} atrasada(s)` : '';
      lines.push('', `🔔 ${alerts.total} conta(s) precisando de atenção${overdue}. Veja em /contas`);
    }

    return [{ text: lines.join('\n') }];
  }

  /**
   * Próximo mês (por meio de pagamento), os dois meses seguintes e o total futuro
   * (próximo mês incluído).
   */
  private futureLines(
    future: { valor: unknown; mesReferencia: string; lancamento: { id: string; tipo: string; meioPagamento: { nome: string } } }[],
    next: string,
  ): string[] {
    if (!future.length) return ['🗓️ <b>Gastos futuros</b>', 'Nenhuma parcela prevista a partir de ' + F.monthName(next).toLowerCase() + '.'];

    const byMonth = new Map<string, number>();
    const nextByMethod = new Map<string, number>();
    const openPlans = new Set<string>();
    let total = 0;
    let lastMonth = next;
    for (const p of future) {
      const value = Number(p.valor);
      total += value;
      byMonth.set(p.mesReferencia, (byMonth.get(p.mesReferencia) ?? 0) + value);
      if (p.mesReferencia === next) {
        const method = p.lancamento.meioPagamento.nome;
        nextByMethod.set(method, (nextByMethod.get(method) ?? 0) + value);
      }
      if (p.lancamento.tipo === TipoLancamento.PARCELADO) openPlans.add(p.lancamento.id);
      if (p.mesReferencia > lastMonth) lastMonth = p.mesReferencia;
    }

    const lines = ['🗓️ <b>Gastos futuros</b>', `${F.monthName(next)}: <b>${F.brl(byMonth.get(next) ?? 0)}</b>`];
    for (const [method, value] of [...nextByMethod.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`  • ${F.esc(method)}: ${F.brl(value)}`);
    }
    for (const m of [BillScheduleHelper.addMonths(next, 1), BillScheduleHelper.addMonths(next, 2)]) {
      const value = byMonth.get(m) ?? 0;
      if (value > 0) lines.push(`${F.monthName(m)}: ${F.brl(value)}`);
    }
    lines.push('', `Total futuro (a partir de ${F.monthName(next).toLowerCase()}): <b>${F.brl(total)}</b>`);
    const plans = openPlans.size ? `${openPlans.size} parcelamento(s) em aberto, ` : '';
    lines.push(`${plans}última parcela em ${F.monthName(lastMonth).toLowerCase()}`);
    return lines;
  }
}
