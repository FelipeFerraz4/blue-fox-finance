import { Injectable } from '@nestjs/common';
import { BillOccurrenceView, BillsService } from '../../bills/bills.service';
import { BotLinkService } from '../bot-link.service';
import { BotFormat as F } from '../bot-format';
import { BotButton, BotReply, BotUser, ConversationState } from '../bot.types';

type ContaValorState = Extract<ConversationState, { flow: 'conta-valor' | 'conta-previsto' }>;

/**
 * `/contas`: avisos de vencimento com botão "Confirmar pagamento" (o bot não paga
 * nada: só registra um pagamento que o usuário já fez) e "Informar valor" para conta
 * variável ainda sem valor no mês. Callbacks `c::<ação>:<id>`.
 */
@Injectable()
export class BillsFlow {
  constructor(
    private readonly bills: BillsService,
    private readonly link: BotLinkService,
  ) {}

  /** Botão para informar (ou alterar) o valor do mês de uma conta variável pendente. */
  static amountButton(o: BillOccurrenceView, suffix = ''): BotButton {
    const verb = o.valor === null ? '✏️ Informar valor' : '✏️ Alterar valor';
    return { label: F.label(`${verb} · ${o.nome}${suffix}`, 40), data: `c::amount:${o.id}` };
  }

  async list(u: BotUser): Promise<BotReply[]> {
    const alerts = await this.bills.getAlerts(u.userId);
    const items = [...alerts.atrasadas, ...alerts.venceHoje, ...alerts.proximas];
    if (!items.length) {
      return [{ text: '🎉 Nenhuma conta atrasada ou vencendo nos próximos dias.' }];
    }

    const lines = items.map((o) => `${this.icon(o)} <b>${F.esc(o.nome)}</b> · ${this.when(o)}${o.valor !== null ? ` · ${F.brl(o.valor)}` : ' · valor a informar'}`);
    const buttons: BotButton[][] = [];
    for (const o of items.slice(0, 10)) {
      buttons.push([{ label: F.label(`✅ Confirmar pagamento · ${o.nome}`, 40), data: `c::pay:${o.id}` }]);
      if (o.valorVariavel && o.valor === null) buttons.push([BillsFlow.amountButton(o)]);
    }
    return [
      {
        text: `<b>Contas a pagar</b>\n\n${lines.join('\n')}\n\n<i>Já pagou alguma? Toque para confirmar o pagamento.</i>`,
        buttons,
      },
    ];
  }

  async onCallback(u: BotUser, action: string, id?: string): Promise<BotReply[]> {
    if (action === 'list') return this.list(u);
    if (!id) return [{ text: 'Opção inválida.' }];

    if (action === 'unpay') {
      const view = await this.bills.unpay(u.userId, id);
      return [{ text: `↩️ Confirmação de pagamento desfeita: <b>${F.esc(view.nome)}</b> voltou para pendente.` }];
    }

    const view = await this.findPending(u, id);
    if (!view) return [{ text: 'Essa conta não está mais pendente.', buttons: [[{ label: '📋 Ver contas', data: 'c::list' }]] }];

    if (action === 'amount') {
      if (view.valorDaFatura) return [{ text: 'O valor dessa conta vem da fatura do cartão.' }];
      await this.link.setState(u.canal, u.externalUserId, {
        flow: 'conta-previsto',
        nonce: F.nonce(),
        occurrenceId: id,
        nome: view.nome,
      });
      const current = view.valor !== null ? `\nValor atual: ${F.brl(view.valor)}` : '';
      return [
        {
          text: `<b>Valor</b> de ${F.esc(view.nome)} (vence ${F.dayMonth(view.dataVencimento)})?${current}\n<i>Exemplo: 120,50 · /cancelar para sair</i>`,
        },
      ];
    }

    if (action === 'pay') {
      if (view.valor === null) {
        // Sem valor previsto: pergunta quanto foi pago
        await this.link.setState(u.canal, u.externalUserId, {
          flow: 'conta-valor',
          nonce: F.nonce(),
          occurrenceId: id,
          nome: view.nome,
        });
        return [{ text: `<b>Valor pago</b> em ${F.esc(view.nome)}?\n<i>Exemplo: 120,50</i>` }];
      }
      return this.pay(u, id);
    }
    return [{ text: 'Opção inválida.' }];
  }

  async onText(u: BotUser, state: ContaValorState, text: string): Promise<BotReply[]> {
    const valor = F.parseAmount(text);
    if (!valor) return [{ text: 'Não entendi o valor. Exemplo: <code>120,50</code> (ou /cancelar).' }];
    if (!(await this.link.consumeState(u.canal, u.externalUserId, state.nonce))) return [];
    if (state.flow === 'conta-previsto') return this.setAmount(u, state.occurrenceId, valor);
    return this.pay(u, state.occurrenceId, valor);
  }

  private async setAmount(u: BotUser, occurrenceId: string, valor: number): Promise<BotReply[]> {
    const view = await this.bills.setAmount(u.userId, occurrenceId, valor);
    return [
      {
        text: `✏️ Valor registrado: <b>${F.esc(view.nome)}</b> · ${F.brl(valor)} · vence ${F.dayMonth(view.dataVencimento)}\n<i>Ele já entra no /resumo. Quando pagar, confirme aqui.</i>`,
        buttons: [[{ label: F.label(`✅ Confirmar pagamento · ${view.nome}`, 40), data: `c::pay:${occurrenceId}` }]],
      },
    ];
  }

  private async pay(u: BotUser, occurrenceId: string, valorPago?: number): Promise<BotReply[]> {
    const view = await this.bills.pay(u.userId, occurrenceId, { valorPago });
    return [
      {
        text: `✅ Pagamento confirmado: <b>${F.esc(view.nome)}</b> · ${F.brl(view.valorPago ?? 0)}`,
        buttons: [[{ label: '↩️ Desfazer', data: `c::unpay:${occurrenceId}` }]],
      },
    ];
  }

  /** Ocorrência pendente do usuário (de qualquer mês), ou null se não existe ou já foi paga. */
  private async findPending(u: BotUser, id: string): Promise<BillOccurrenceView | null> {
    try {
      const view = await this.bills.getOccurrence(u.userId, id);
      return view.pagoEm ? null : view;
    } catch {
      return null;
    }
  }

  private icon(o: BillOccurrenceView) {
    return o.status === 'ATRASADA' ? '🔴' : o.status === 'VENCE_HOJE' ? '🟠' : '🟡';
  }

  private when(o: BillOccurrenceView) {
    if (o.status === 'ATRASADA') return `atrasada ${Math.abs(o.diasParaVencer)}d`;
    if (o.status === 'VENCE_HOJE') return 'vence hoje';
    return o.diasParaVencer === 1 ? 'vence amanhã' : `vence em ${o.diasParaVencer} dias`;
  }
}
