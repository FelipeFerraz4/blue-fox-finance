import { Injectable } from '@nestjs/common';
import { BillOccurrenceView, BillsService } from '../../bills/bills.service';
import { BotLinkService } from '../bot-link.service';
import { BotFormat as F } from '../bot-format';
import { BotButton, BotReply, BotUser, ConversationState } from '../bot.types';
import { t } from '../../../common/i18n/translate';

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
    const verb = o.valor === null ? t('✏️ Informar valor') : t('✏️ Alterar valor');
    return { label: F.label(`${verb} · ${o.nome}${suffix}`, 40), data: `c::amount:${o.id}` };
  }

  async list(u: BotUser): Promise<BotReply[]> {
    const alerts = await this.bills.getAlerts(u.userId);
    const items = [...alerts.atrasadas, ...alerts.venceHoje, ...alerts.proximas];
    if (!items.length) {
      return [{ text: t('🎉 Nenhuma conta atrasada ou vencendo nos próximos dias.') }];
    }

    const lines = items.map((o) => `${this.icon(o)} <b>${F.esc(o.nome)}</b> · ${this.when(o)} · ${o.valor !== null ? F.brl(o.valor) : t('valor a informar')}`);
    const buttons: BotButton[][] = [];
    for (const o of items.slice(0, 10)) {
      buttons.push([{ label: F.label(`${t('✅ Confirmar pagamento')} · ${o.nome}`, 40), data: `c::pay:${o.id}` }]);
      if (o.valorVariavel && o.valor === null) buttons.push([BillsFlow.amountButton(o)]);
    }
    return [
      {
        text: `${t('<b>Contas a pagar</b>')}\n\n${lines.join('\n')}\n\n${t('<i>Já pagou alguma? Toque para confirmar o pagamento.</i>')}`,
        buttons,
      },
    ];
  }

  async onCallback(u: BotUser, action: string, id?: string): Promise<BotReply[]> {
    if (action === 'list') return this.list(u);
    if (!id) return [{ text: t('Opção inválida.') }];

    if (action === 'unpay') {
      const view = await this.bills.unpay(u.userId, id);
      return [{ text: t('↩️ Confirmação de pagamento desfeita: <b>{nome}</b> voltou para pendente.', { nome: F.esc(view.nome) }) }];
    }

    const view = await this.findPending(u, id);
    if (!view) return [{ text: t('Essa conta não está mais pendente.'), buttons: [[{ label: t('📋 Ver contas'), data: 'c::list' }]] }];

    if (action === 'amount') {
      if (view.valorDaFatura) return [{ text: t('O valor dessa conta vem da fatura do cartão.') }];
      await this.link.setState(u.canal, u.externalUserId, {
        flow: 'conta-previsto',
        nonce: F.nonce(),
        occurrenceId: id,
        nome: view.nome,
      });
      const current = view.valor !== null ? `\n${t('Valor atual: {valor}', { valor: F.brl(view.valor) })}` : '';
      return [
        {
          text: `${t('💰 <b>Valor de {nome}</b> (vence {data})', { nome: F.esc(view.nome), data: F.dayMonth(view.dataVencimento) })}${current}\n${t('Digite o valor. <i>Exemplo: {exemplo} · /cancelar para sair</i>', { exemplo: F.amountExample() })}`,
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
        return [{ text: `${t('💰 <b>Valor pago em {nome}</b>', { nome: F.esc(view.nome) })}\n${t('Digite o valor. <i>Exemplo: {exemplo} · /cancelar para sair</i>', { exemplo: F.amountExample() })}` }];
      }
      return this.pay(u, id);
    }
    return [{ text: t('Opção inválida.') }];
  }

  async onText(u: BotUser, state: ContaValorState, text: string): Promise<BotReply[]> {
    const valor = F.parseAmount(text);
    if (!valor) return [{ text: t('Não entendi o valor. Exemplo: <code>120,50</code> (ou /cancelar).') }];
    if (!(await this.link.consumeState(u.canal, u.externalUserId, state.nonce))) return [];
    if (state.flow === 'conta-previsto') return this.setAmount(u, state.occurrenceId, valor);
    return this.pay(u, state.occurrenceId, valor);
  }

  private async setAmount(u: BotUser, occurrenceId: string, valor: number): Promise<BotReply[]> {
    const view = await this.bills.setAmount(u.userId, occurrenceId, valor);
    return [
      {
        text: `${t('✏️ Valor registrado: <b>{nome}</b> · {valor} · vence {data}', { nome: F.esc(view.nome), valor: F.brl(valor), data: F.dayMonth(view.dataVencimento) })}\n${t('<i>Ele já entra no /resumo. Quando pagar, confirme aqui.</i>')}`,
        buttons: [[{ label: F.label(`${t('✅ Confirmar pagamento')} · ${view.nome}`, 40), data: `c::pay:${occurrenceId}` }]],
      },
    ];
  }

  private async pay(u: BotUser, occurrenceId: string, valorPago?: number): Promise<BotReply[]> {
    const view = await this.bills.pay(u.userId, occurrenceId, { valorPago });
    return [
      {
        text: t('✅ Pagamento confirmado: <b>{nome}</b> · {valor}', { nome: F.esc(view.nome), valor: F.brl(view.valorPago ?? 0) }),
        buttons: [[{ label: t('↩️ Desfazer'), data: `c::unpay:${occurrenceId}` }]],
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
    if (o.status === 'ATRASADA') return t('atrasada {n}d', { n: Math.abs(o.diasParaVencer) });
    if (o.status === 'VENCE_HOJE') return t('vence hoje');
    return o.diasParaVencer === 1 ? t('vence amanhã') : t('vence em {n} dias', { n: o.diasParaVencer });
  }
}
