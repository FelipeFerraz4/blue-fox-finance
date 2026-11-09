import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BillsService } from '../../bills/bills.service';
import { BillScheduleHelper } from '../../../common/helpers/bill-schedule.helper';
import { BotFormat as F } from '../bot-format';
import { BotReply, BotUser } from '../bot.types';

/**
 * `/resumo`: gastos do mês pelo mês do pagamento (mesma visão do Dashboard:
 * cada parcela conta no mês em que é paga).
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

    const [installments, previousTotal, alerts] = await Promise.all([
      this.prisma.parcela.findMany({
        where: { mesReferencia: month, lancamento: { userId: u.userId } },
        select: { valor: true, lancamento: { select: { categoria: true } } },
      }),
      this.prisma.parcela.aggregate({
        where: { mesReferencia: previous, lancamento: { userId: u.userId } },
        _sum: { valor: true },
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
    if (alerts.total > 0) {
      const overdue = alerts.atrasadas.length ? `, ${alerts.atrasadas.length} atrasada(s)` : '';
      lines.push('', `🔔 ${alerts.total} conta(s) precisando de atenção${overdue}. Veja em /contas`);
    }

    return [{ text: lines.join('\n') }];
  }
}
