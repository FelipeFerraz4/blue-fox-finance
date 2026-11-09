import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModalidadePagamento, OrigemLancamento, TipoLancamento } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExpensesService } from '../../expenses/expenses.service';
import { PreferencesService } from '../../preferences/preferences.service';
import { BillScheduleHelper } from '../../../common/helpers/bill-schedule.helper';
import { BotLinkService } from '../bot-link.service';
import { BotFormat as F } from '../bot-format';
import { BotButton, BotReply, BotUser, ConversationState, ExpenseDraft, ExpenseStep } from '../bot.types';

type GastoState = Extract<ConversationState, { flow: 'gasto' }>;

const MAX_TEXT = 120;
const CANCEL = (nonce: string): BotButton => ({ label: '❌ Cancelar', data: `g:${nonce}:cancel` });

/**
 * Assistente de lançamento: pergunta só o que falta (padrões das preferências
 * já vêm preenchidos), mostra o resumo e grava pelo ExpensesService.
 * Callbacks com estado: `g:<nonce>:<ação>:<arg>`. Sem estado: `x::<ação>:<id>`.
 */
@Injectable()
export class ExpenseFlow {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expenses: ExpensesService,
    private readonly preferences: PreferencesService,
    private readonly link: BotLinkService,
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // Entrada
  // ---------------------------------------------------------------------------

  /** `/gasto [valor] [item] [@ loja]`, ou texto solto começando por um valor. */
  async start(u: BotUser, args: string): Promise<BotReply[]> {
    const hasMethod = await this.prisma.paymentMethod.count({ where: { userId: u.userId, ativo: true } });
    if (!hasMethod) {
      return [this.withSiteLink('Antes de lançar, cadastre um meio de pagamento no site.', '/payment-methods')];
    }

    const draft = await this.defaults(u.userId);
    const [left, storeText] = args.split('@').map((s) => s.trim());
    if (left) {
      const [first, ...rest] = left.split(/\s+/);
      const valor = F.parseAmount(first);
      if (valor) {
        draft.valor = valor;
        if (rest.length) draft.nome = rest.join(' ').slice(0, MAX_TEXT);
      } else {
        draft.nome = left.slice(0, MAX_TEXT);
      }
    }
    if (storeText) await this.applyStoreText(u.userId, draft, storeText);
    return this.advance(u, draft);
  }

  async onText(u: BotUser, state: GastoState, text: string): Promise<BotReply[]> {
    const { draft } = state;
    const value = text.trim();
    switch (state.step) {
      case 'valor': {
        const valor = F.parseAmount(value);
        if (!valor) return this.retry(u, state, 'Não entendi o valor. Exemplo: <code>45,90</code>');
        draft.valor = valor;
        break;
      }
      case 'nome':
        if (!value) return this.retry(u, state, 'Digite o que foi comprado.');
        draft.nome = value.slice(0, MAX_TEXT);
        break;
      case 'loja':
        await this.applyStoreText(u.userId, draft, value);
        break;
      case 'meio': {
        const method = await this.prisma.paymentMethod.findFirst({
          where: { userId: u.userId, ativo: true, nome: { contains: value, mode: 'insensitive' } },
        });
        if (!method) return this.retry(u, state, 'Não achei esse meio de pagamento. Toque numa opção.');
        this.applyMethod(draft, method);
        break;
      }
      case 'categoria': {
        const existing = await this.prisma.categoriaItem.findFirst({
          where: { userId: u.userId, nome: { equals: value, mode: 'insensitive' } },
        });
        draft.categoria = existing?.nome ?? value.slice(0, MAX_TEXT);
        break;
      }
      case 'comprador': {
        const buyer = await this.prisma.comprador.findFirst({
          where: { userId: u.userId, nome: { equals: value, mode: 'insensitive' } },
        });
        draft.comprador = buyer?.nome ?? value.slice(0, MAX_TEXT);
        draft.compradorId = buyer?.id ?? null;
        break;
      }
      case 'parcelas': {
        const n = Number(value.replace(/x$/i, ''));
        if (!Number.isInteger(n) || n < 1 || n > 48) return this.retry(u, state, 'Digite um número de 1 a 48.');
        draft.parcelas = n;
        break;
      }
      case 'data': {
        const date = F.parseDate(value, BillScheduleHelper.today());
        if (!date) return this.retry(u, state, 'Data inválida. Use <code>dd/mm</code> ou <code>dd/mm/aaaa</code>.');
        draft.data = date;
        break;
      }
      case 'confirmar':
        return this.retry(u, state, 'Use os botões para salvar, cancelar ou alterar.');
    }
    return this.advance(u, draft);
  }

  async onCallback(u: BotUser, state: ConversationState | null, nonce: string, action: string, arg?: string) {
    if (!state || state.flow !== 'gasto' || state.nonce !== nonce) {
      return [{ text: 'Esse botão expirou. Use /gasto para um novo lançamento.' }];
    }
    const { draft } = state;

    switch (action) {
      case 'cancel':
        await this.link.clearState(u.canal, u.externalUserId);
        return [{ text: 'Lançamento cancelado.' }];

      case 'save':
        return this.save(u, state);

      case 'pick': {
        const id = state.options?.[Number(arg)];
        if (!id) return this.retry(u, state, 'Opção inválida.');
        await this.applyOption(u.userId, state.step, draft, id);
        return this.advance(u, draft);
      }

      case 'parc':
        draft.parcelas = Math.min(48, Math.max(1, Number(arg) || 1));
        return this.advance(u, draft);

      case 'date':
        draft.data = arg === 'ontem' ? F.addDays(BillScheduleHelper.today(), -1) : BillScheduleHelper.today();
        return this.advance(u, draft);

      case 'edit':
        return this.edit(u, draft, arg as ExpenseStep);
    }
    return this.retry(u, state, 'Opção inválida.');
  }

  /** Stateless: desfazer / excluir lançamentos. */
  async onStatelessCallback(u: BotUser, action: string, id?: string): Promise<BotReply[]> {
    if (!id && action !== 'keep') return [{ text: 'Opção inválida.' }];
    switch (action) {
      case 'undo':
      case 'delok': {
        const expense = await this.prisma.lancamento.findFirst({ where: { id, userId: u.userId } });
        if (!expense) return [{ text: 'Esse lançamento já não existe.' }];
        await this.expenses.remove(u.userId, expense.id);
        return [{ text: `🗑 Excluído: <b>${F.esc(expense.nome)}</b> · ${F.brl(expense.valorTotal)}` }];
      }
      case 'del': {
        const expense = await this.prisma.lancamento.findFirst({ where: { id, userId: u.userId } });
        if (!expense) return [{ text: 'Esse lançamento já não existe.' }];
        return [
          {
            text: `Excluir <b>${F.esc(expense.nome)}</b> · ${F.brl(expense.valorTotal)} (${F.date(expense.data)})?`,
            buttons: [[
              { label: '🗑 Sim, excluir', data: `x::delok:${expense.id}` },
              { label: 'Não', data: 'x::keep' },
            ]],
          },
        ];
      }
      case 'keep':
        return [{ text: 'Ok, mantido.' }];
    }
    return [{ text: 'Opção inválida.' }];
  }

  /** `/ultimos`: 5 lançamentos mais recentes, com botão para excluir. */
  async recent(u: BotUser): Promise<BotReply[]> {
    const items = await this.prisma.lancamento.findMany({
      where: { userId: u.userId },
      include: { meioPagamento: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    if (!items.length) return [{ text: 'Você ainda não tem lançamentos. Use /gasto para criar o primeiro.' }];

    const lines = items.map(
      (e, i) =>
        `${i + 1}. <b>${F.esc(e.nome)}</b> · ${F.brl(e.valorTotal)}\n    ${F.date(e.data)} · ${F.esc(e.loja)} · ${F.esc(e.meioPagamento.nome)}` +
        (e.numeroParcelas > 1 ? ` · ${e.numeroParcelas}x` : ''),
    );
    const buttons = items.map((e, i) => ({ label: `🗑 ${i + 1}`, data: `x::del:${e.id}` }));
    return [{ text: `<b>Últimos lançamentos</b>\n\n${lines.join('\n')}`, buttons: [buttons] }];
  }

  // ---------------------------------------------------------------------------
  // Máquina de estados
  // ---------------------------------------------------------------------------

  private async advance(u: BotUser, draft: ExpenseDraft, forced?: ExpenseStep): Promise<BotReply[]> {
    await this.autofill(u.userId, draft);
    const step = forced ?? this.firstMissing(draft);
    const nonce = F.nonce();
    const { reply, options } = await this.prompt(u.userId, step, draft, nonce);
    await this.link.setState(u.canal, u.externalUserId, { flow: 'gasto', nonce, step, draft, options });
    return [reply];
  }

  /** Reapresenta a pergunta atual com uma mensagem de erro, sem perder o rascunho. */
  private async retry(u: BotUser, state: GastoState, message: string): Promise<BotReply[]> {
    const replies = await this.advance(u, state.draft, state.step);
    return [{ text: message }, ...replies];
  }

  private firstMissing(d: ExpenseDraft): ExpenseStep {
    if (!d.valor) return 'valor';
    if (!d.nome) return 'nome';
    if (!d.loja) return 'loja';
    if (!d.meioPagamentoId) return 'meio';
    if (!d.categoria) return 'categoria';
    if (!d.comprador) return 'comprador';
    return 'confirmar';
  }

  private edit(u: BotUser, d: ExpenseDraft, field: ExpenseStep): Promise<BotReply[]> {
    switch (field) {
      case 'valor':
        d.valor = undefined;
        break;
      case 'nome':
        d.nome = undefined;
        break;
      case 'loja':
        d.loja = undefined;
        d.lojaId = null;
        break;
      case 'meio':
        d.meioPagamentoId = undefined;
        d.meioNome = undefined;
        d.credito = false;
        d.parcelas = 1;
        break;
      case 'categoria':
        d.categoria = undefined;
        break;
      case 'comprador':
        d.comprador = undefined;
        d.compradorId = null;
        // Força a pergunta mesmo com um único comprador
        return this.advance(u, d, 'comprador');
      case 'parcelas':
      case 'data':
        return this.advance(u, d, field);
    }
    return this.advance(u, d);
  }

  /** Preenche o que dá para deduzir sem perguntar. */
  private async autofill(userId: string, d: ExpenseDraft) {
    if (!d.categoria && d.lojaId) {
      const store = await this.prisma.loja.findFirst({ where: { id: d.lojaId, userId }, select: { categoria: true } });
      if (store?.categoria) d.categoria = store.categoria;
    }
    if (!d.meioPagamentoId) {
      const methods = await this.prisma.paymentMethod.findMany({ where: { userId, ativo: true }, take: 2 });
      if (methods.length === 1) this.applyMethod(d, methods[0]);
    }
    if (!d.comprador) {
      const buyers = await this.prisma.comprador.findMany({ where: { userId, ativo: true }, take: 2 });
      if (buyers.length === 0) {
        d.comprador = 'Eu';
      } else if (buyers.length === 1) {
        d.comprador = buyers[0].nome;
        d.compradorId = buyers[0].id;
      }
    }
  }

  private async defaults(userId: string): Promise<ExpenseDraft> {
    const prefs = await this.preferences.getExpensePreferences(userId);
    const draft: ExpenseDraft = { parcelas: 1, data: BillScheduleHelper.today() };
    if (prefs.compradorPadrao) {
      draft.comprador = prefs.compradorPadrao.nome;
      draft.compradorId = prefs.compradorPadrao.id;
    }
    if (prefs.lojaPadrao) {
      draft.loja = prefs.lojaPadrao.nome;
      draft.lojaId = prefs.lojaPadrao.id;
    }
    if (prefs.meioPagamentoPadrao) this.applyMethod(draft, prefs.meioPagamentoPadrao);
    if (prefs.categoriaPadrao) draft.categoria = prefs.categoriaPadrao;
    return draft;
  }

  private applyMethod(d: ExpenseDraft, m: { id: string; nome: string; modalidade: ModalidadePagamento }) {
    d.meioPagamentoId = m.id;
    d.meioNome = m.nome;
    d.credito = m.modalidade === ModalidadePagamento.CREDITO;
    if (!d.credito) d.parcelas = 1;
  }

  private async applyStoreText(userId: string, d: ExpenseDraft, text: string) {
    const name = text.trim().slice(0, MAX_TEXT);
    if (!name) return;
    const store = await this.prisma.loja.findFirst({
      where: { userId, nome: { equals: name, mode: 'insensitive' } },
    });
    d.loja = store?.nome ?? name;
    d.lojaId = store?.id ?? null;
  }

  private async applyOption(userId: string, step: ExpenseStep, d: ExpenseDraft, id: string) {
    // Os ids vêm do próprio estado, mas a consulta continua filtrando por userId
    switch (step) {
      case 'loja': {
        const store = await this.prisma.loja.findFirst({ where: { id, userId } });
        if (store) {
          d.loja = store.nome;
          d.lojaId = store.id;
        }
        break;
      }
      case 'meio': {
        const method = await this.prisma.paymentMethod.findFirst({ where: { id, userId } });
        if (method) this.applyMethod(d, method);
        break;
      }
      case 'categoria':
        d.categoria = id;
        break;
      case 'comprador': {
        const buyer = await this.prisma.comprador.findFirst({ where: { id, userId } });
        if (buyer) {
          d.comprador = buyer.nome;
          d.compradorId = buyer.id;
        }
        break;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Perguntas
  // ---------------------------------------------------------------------------

  private async prompt(
    userId: string,
    step: ExpenseStep,
    d: ExpenseDraft,
    nonce: string,
  ): Promise<{ reply: BotReply; options?: string[] }> {
    const pick = (items: { id: string; label: string }[], perRow: number) =>
      F.rows(
        items.map((it, i) => ({ label: F.label(it.label), data: `g:${nonce}:pick:${i}` })),
        perRow,
      );

    switch (step) {
      case 'valor':
        return { reply: { text: '💰 Qual o valor?\n<i>Exemplo: 45,90</i>', buttons: [[CANCEL(nonce)]] } };

      case 'nome':
        return {
          reply: { text: `💰 ${F.brl(d.valor!)}\n🛒 O que foi comprado?`, buttons: [[CANCEL(nonce)]] },
        };

      case 'loja': {
        const stores = await this.topStores(userId);
        const items = stores.map((s) => ({ id: s.id, label: s.nome }));
        return {
          reply: {
            text: stores.length ? '🏪 Onde foi? Toque numa loja ou digite o nome.' : '🏪 Onde foi? Digite o nome da loja.',
            buttons: [...pick(items, 2), [CANCEL(nonce)]],
          },
          options: items.map((i) => i.id),
        };
      }

      case 'meio': {
        const methods = await this.prisma.paymentMethod.findMany({
          where: { userId, ativo: true },
          orderBy: { nome: 'asc' },
          take: 12,
        });
        const items = methods.map((m) => ({ id: m.id, label: m.nome }));
        return {
          reply: { text: '💳 Como pagou?', buttons: [...pick(items, 2), [CANCEL(nonce)]] },
          options: items.map((i) => i.id),
        };
      }

      case 'categoria': {
        const cats = await this.prisma.categoriaItem.findMany({
          where: { userId, ativo: true },
          orderBy: { nome: 'asc' },
          take: 12,
        });
        // Para categoria, a "opção" guardada é o próprio nome (Lancamento.categoria é texto)
        const items = cats.map((c) => ({ id: c.nome, label: c.nome }));
        return {
          reply: {
            text: cats.length ? '🏷 Qual a categoria? Toque ou digite.' : '🏷 Qual a categoria? Digite o nome.',
            buttons: [...pick(items, 3), [CANCEL(nonce)]],
          },
          options: items.map((i) => i.id),
        };
      }

      case 'comprador': {
        const buyers = await this.prisma.comprador.findMany({
          where: { userId, ativo: true },
          orderBy: { nome: 'asc' },
          take: 12,
        });
        const items = buyers.map((b) => ({ id: b.id, label: b.nome }));
        return {
          reply: { text: '👤 Quem comprou? Toque ou digite.', buttons: [...pick(items, 2), [CANCEL(nonce)]] },
          options: items.map((i) => i.id),
        };
      }

      case 'parcelas': {
        const buttons: BotButton[] = [{ label: 'À vista', data: `g:${nonce}:parc:1` }];
        for (let n = 2; n <= 12; n++) buttons.push({ label: `${n}x`, data: `g:${nonce}:parc:${n}` });
        return {
          reply: { text: '🔢 Em quantas vezes? Toque ou digite (até 48).', buttons: [...F.rows(buttons, 4), [CANCEL(nonce)]] },
        };
      }

      case 'data':
        return {
          reply: {
            text: '📅 Qual a data? Toque ou digite <code>dd/mm</code>.',
            buttons: [
              [
                { label: 'Hoje', data: `g:${nonce}:date:hoje` },
                { label: 'Ontem', data: `g:${nonce}:date:ontem` },
              ],
              [CANCEL(nonce)],
            ],
          },
        };

      case 'confirmar':
        return { reply: this.summary(d, nonce) };
    }
  }

  private summary(d: ExpenseDraft, nonce: string): BotReply {
    const installment =
      d.parcelas > 1 ? `  <i>(${d.parcelas}x de ${F.brl(Math.round((d.valor! / d.parcelas) * 100) / 100)})</i>` : '';
    const text = [
      '<b>Confirma o lançamento?</b>',
      '',
      `🛒 <b>${F.esc(d.nome)}</b>`,
      `💰 ${F.brl(d.valor!)}${installment}`,
      `🏪 ${F.esc(d.loja)}`,
      `🏷 ${F.esc(d.categoria)}`,
      `💳 ${F.esc(d.meioNome)}`,
      `👤 ${F.esc(d.comprador)}`,
      `📅 ${F.date(d.data)}`,
    ].join('\n');

    const edit = (label: string, field: ExpenseStep): BotButton => ({ label, data: `g:${nonce}:edit:${field}` });
    const lastRow = [edit('Comprador', 'comprador'), edit('Data', 'data')];
    if (d.credito) lastRow.push(edit('Parcelas', 'parcelas'));

    return {
      text,
      buttons: [
        [
          { label: '✅ Salvar', data: `g:${nonce}:save` },
          CANCEL(nonce),
        ],
        [edit('Valor', 'valor'), edit('Item', 'nome'), edit('Loja', 'loja')],
        [edit('Categoria', 'categoria'), edit('Pagamento', 'meio')],
        lastRow,
      ],
    };
  }

  /** Lojas mais usadas primeiro, completando com as demais em ordem alfabética. */
  private async topStores(userId: string) {
    const used = await this.prisma.lancamento.groupBy({
      by: ['lojaId'],
      where: { userId, lojaId: { not: null } },
      _count: { lojaId: true },
      orderBy: { _count: { lojaId: 'desc' } },
      take: 8,
    });
    const ids = used.map((u) => u.lojaId!) as string[];
    const top = await this.prisma.loja.findMany({ where: { userId, id: { in: ids } } });
    const ordered = ids.map((id) => top.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);
    if (ordered.length < 8) {
      const rest = await this.prisma.loja.findMany({
        where: { userId, id: { notIn: ids } },
        orderBy: { nome: 'asc' },
        take: 8 - ordered.length,
      });
      ordered.push(...rest);
    }
    return ordered;
  }

  // ---------------------------------------------------------------------------
  // Gravação
  // ---------------------------------------------------------------------------

  private async save(u: BotUser, state: GastoState): Promise<BotReply[]> {
    const d = state.draft;
    if (this.firstMissing(d) !== 'confirmar') return this.advance(u, d);

    // Só quem consumir o estado grava (clique duplo / update reenviado)
    if (!(await this.link.consumeState(u.canal, u.externalUserId, state.nonce))) {
      return [{ text: 'Esse lançamento já foi processado.' }];
    }

    const parcelas = d.credito ? d.parcelas : 1;
    const created = await this.expenses.create(
      u.userId,
      {
        comprador: d.comprador!,
        compradorId: d.compradorId ?? undefined,
        nome: d.nome!,
        loja: d.loja!,
        lojaId: d.lojaId ?? undefined,
        data: d.data,
        categoria: d.categoria!,
        quantidade: 1,
        valorUnitario: d.valor!,
        valorTotal: d.valor!,
        meioPagamentoId: d.meioPagamentoId!,
        tipo: parcelas > 1 ? TipoLancamento.PARCELADO : TipoLancamento.A_VISTA,
        numeroParcelas: parcelas,
      },
      OrigemLancamento.TELEGRAM,
    );

    const first = created.parcelas[0];
    const payment =
      parcelas > 1
        ? `${parcelas}x de ${F.brl(first.valor)}, 1ª em ${F.monthName(first.mesReferencia).toLowerCase()}`
        : first && d.credito
          ? `fatura de ${F.monthName(first.mesReferencia).toLowerCase()}`
          : '';

    const reply = this.withSiteLink(
      [
        '✅ <b>Lançado!</b>',
        `🛒 ${F.esc(created.nome)} · ${F.brl(created.valorTotal)}`,
        `🏪 ${F.esc(created.loja)} · 💳 ${F.esc(created.meioPagamento.nome)}${payment ? ` (${payment})` : ''}`,
      ].join('\n'),
      '/expenses',
    );
    reply.buttons = [[{ label: '↩️ Desfazer', data: `x::undo:${created.id}` }, ...(reply.buttons?.[0] ?? [])]];
    return [reply];
  }

  /** Botão "Ver no site" só com URL https (o Telegram recusa localhost/http). */
  private withSiteLink(text: string, path: string): BotReply {
    const base = this.config.get<string>('FRONTEND_URL', '');
    if (!base.startsWith('https://')) return { text };
    return { text, buttons: [[{ label: '🌐 Ver no site', url: `${base.replace(/\/$/, '')}${path}` }]] };
  }
}
