import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModalidadePagamento, OrigemLancamento, TipoLancamento } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExpensesService } from '../../expenses/expenses.service';
import { PreferencesService } from '../../preferences/preferences.service';
import { BillScheduleHelper } from '../../../common/helpers/bill-schedule.helper';
import { BotLinkService } from '../bot-link.service';
import { BotFormat as F } from '../bot-format';
import {
  BotButton,
  BotReply,
  BotUser,
  ConversationState,
  ExpenseDraft,
  ExpenseItemDraft,
  ExpenseStep,
  FormKind,
  RegistrableStep,
} from '../bot.types';
import { RegisterFlow } from './register.flow';
import { t } from '../../../common/i18n/translate';

type GastoState = Extract<ConversationState, { flow: 'gasto' }>;
type Option = { id: string; label: string };

const MAX_TEXT = 120;
const MAX_OPTIONS = 10;
const CANCEL = (nonce: string): BotButton => ({ label: t('❌ Cancelar'), data: `g:${nonce}:cancel` });

/**
 * Cadastro aberto quando o item digitado não existe (ou pelo botão ➕). Textos em
 * português (chaves do t(), traduzidos na hora de mostrar).
 */
const REGISTRABLE: Record<RegistrableStep, { form: FormKind; novo: string; cadastrar: string; outro: string; missing: string }> = {
  comprador: {
    form: 'comprador',
    novo: 'Novo comprador',
    cadastrar: '➕ Cadastrar comprador',
    outro: 'Escolher outro',
    missing: '<b>{nome}</b> não está cadastrado como comprador.',
  },
  loja: {
    form: 'loja',
    novo: 'Nova loja',
    cadastrar: '➕ Cadastrar loja',
    outro: 'Escolher outra',
    missing: '<b>{nome}</b> não está cadastrada como loja.',
  },
  meio: {
    form: 'meio',
    novo: 'Novo meio de pagamento',
    cadastrar: '➕ Cadastrar meio de pagamento',
    outro: 'Escolher outro',
    missing: '<b>{nome}</b> não está cadastrado como meio de pagamento.',
  },
  categoria: {
    form: 'categoria-item',
    novo: 'Nova categoria',
    cadastrar: '➕ Cadastrar categoria',
    outro: 'Escolher outra',
    missing: '<b>{nome}</b> não está cadastrada como categoria.',
  },
};
const isRegistrable = (step: ExpenseStep): step is RegistrableStep => step in REGISTRABLE;
const isItemStep = (step: ExpenseStep): boolean =>
  step === 'nome' || step === 'categoria' || step === 'quantidade' || step === 'valor';

/** Rótulos idênticos aos da tela "Novo Lançamento" do site (em português; use `label()`). */
const LABEL: Record<Exclude<ExpenseStep, 'confirmar'>, string> = {
  comprador: 'Comprador',
  loja: 'Loja',
  data: 'Data da Compra',
  meio: 'Meio de Pagamento',
  tipo: 'Tipo de Pagamento',
  parcelas: 'Número de Parcelas',
  nome: 'Nome',
  categoria: 'Categoria',
  quantidade: 'Quantidade',
  valor: 'Valor Unitário ({moeda})',
};

/** Rótulo do campo no idioma do usuário, com a moeda do país no valor. */
const label = (step: Exclude<ExpenseStep, 'confirmar'>) => t(LABEL[step], { moeda: F.currencySymbol() });

/**
 * Assistente de lançamento: pergunta campo a campo, na mesma ordem e com os
 * mesmos nomes da tela "Novo Lançamento". Ao terminar um item, permite adicionar
 * mais itens à mesma compra (reaproveitando comprador, loja, data, meio e parcelas)
 * ou finalizar a compra.
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
    @Inject(forwardRef(() => RegisterFlow))
    private readonly register: RegisterFlow,
  ) {}

  // ---------------------------------------------------------------------------
  // Entrada
  // ---------------------------------------------------------------------------

  /**
   * `/lancamento`, ou atalho `/lancamento 45,90 pão @ padaria` (também como texto solto
   * começando pelo valor): o que foi digitado já entra no rascunho
   * (valor unitário com quantidade 1, nome e loja) e o resto é perguntado.
   */
  async start(u: BotUser, args: string): Promise<BotReply[]> {
    const draft: ExpenseDraft = { items: [] };
    const [left, storeText] = args.split('@').map((s) => s.trim());
    if (left) {
      const [first, ...rest] = left.split(/\s+/);
      const valor = F.parseAmount(first);
      if (valor) {
        draft.valorUnitario = valor;
        draft.quantidade = 1;
        if (rest.length) draft.nome = rest.join(' ').slice(0, MAX_TEXT);
      } else {
        draft.nome = left.slice(0, MAX_TEXT);
      }
    }
    if (storeText && !(await this.applyStoreText(u.userId, draft, storeText))) {
      draft.lojaSugerida = storeText.slice(0, MAX_TEXT);
    }

    const hasMethod = await this.prisma.paymentMethod.count({ where: { userId: u.userId, ativo: true } });
    if (!hasMethod) {
      // Sem meio de pagamento não dá para lançar: cadastra agora e segue o lançamento
      const replies = await this.register.start(u, 'meio', '', { draft, step: 'meio' });
      return [{ text: t('Você ainda não tem um meio de pagamento. Vamos cadastrar um e já seguir com o lançamento.') }, ...replies];
    }
    // O nome da operação aparece só na primeira pergunta
    return F.withIntro(await this.advance(u, draft), t('📝 <i>Novo lançamento</i>'));
  }

  /** Volta ao lançamento depois de cadastrar o item na hora, já com ele escolhido. */
  async resume(u: BotUser, draft: ExpenseDraft, step: RegistrableStep, created: { id: string; nome: string; modalidade?: unknown }) {
    switch (step) {
      case 'comprador':
        draft.comprador = created.nome;
        draft.compradorId = created.id;
        break;
      case 'loja':
        draft.loja = created.nome;
        draft.lojaId = created.id;
        break;
      case 'meio':
        this.applyMethod(draft, created as { id: string; nome: string; modalidade: ModalidadePagamento });
        break;
      case 'categoria':
        draft.categoria = created.nome;
        break;
    }
    return this.advance(u, draft);
  }

  /** Cadastro cancelado: volta para a mesma pergunta do lançamento. */
  backTo(u: BotUser, draft: ExpenseDraft, step: RegistrableStep) {
    return this.advance(u, draft, step);
  }

  async onText(u: BotUser, state: GastoState, text: string): Promise<BotReply[]> {
    const { draft } = state;
    const value = text.trim();
    switch (state.step) {
      case 'comprador': {
        if (!value) return this.retry(u, state, t('Digite o nome do comprador.'));
        const buyer = await this.prisma.comprador.findFirst({
          where: { userId: u.userId, nome: { equals: value, mode: 'insensitive' } },
        });
        if (!buyer) return this.notRegistered(u, draft, 'comprador', value);
        draft.comprador = buyer.nome;
        draft.compradorId = buyer.id;
        break;
      }
      case 'loja':
        if (!value) return this.retry(u, state, t('Digite o nome da loja.'));
        if (!(await this.applyStoreText(u.userId, draft, value))) return this.notRegistered(u, draft, 'loja', value);
        break;
      case 'data': {
        const date = F.parseDate(value, BillScheduleHelper.today());
        if (!date) return this.retry(u, state, t('Data inválida. Use <code>{dm}</code> ou <code>{dma}</code>.', { dm: F.datePattern(), dma: F.datePattern(true) }));
        draft.data = date;
        break;
      }
      case 'meio': {
        const method = await this.prisma.paymentMethod.findFirst({
          where: { userId: u.userId, ativo: true, nome: { contains: value, mode: 'insensitive' } },
        });
        if (!method) return this.notRegistered(u, draft, 'meio', value);
        this.applyMethod(draft, method);
        break;
      }
      case 'tipo':
        return this.retry(u, state, t('Toque em <b>À Vista</b> ou <b>Parcelado</b>.'));
      case 'parcelas': {
        const n = Number(value.replace(/x$/i, ''));
        if (!Number.isInteger(n) || n < 2 || n > 48) return this.retry(u, state, t('Digite um número de 2 a 48.'));
        draft.parcelas = n;
        break;
      }
      case 'nome':
        if (!value) return this.retry(u, state, t('Digite o nome do item.'));
        draft.nome = value.slice(0, MAX_TEXT);
        break;
      case 'categoria': {
        if (!value) return this.retry(u, state, t('Digite a categoria.'));
        const existing = await this.prisma.categoriaItem.findFirst({
          where: { userId: u.userId, nome: { equals: value, mode: 'insensitive' } },
        });
        if (!existing) return this.notRegistered(u, draft, 'categoria', value);
        draft.categoria = existing.nome;
        break;
      }
      case 'quantidade': {
        const qty = F.parseQuantity(value);
        if (!qty) return this.retry(u, state, t('Quantidade inválida. Exemplo: <code>1</code> ou <code>2,5</code>.'));
        draft.quantidade = qty;
        break;
      }
      case 'valor': {
        const valor = F.parseAmount(value);
        if (!valor) return this.retry(u, state, t('Não entendi o valor. Exemplo: <code>45,90</code>'));
        draft.valorUnitario = valor;
        break;
      }
      case 'confirmar':
        return this.retry(u, state, t('Use os botões para adicionar outro item, finalizar a compra ou editar.'));
    }
    return this.advance(u, draft);
  }

  async onCallback(u: BotUser, state: ConversationState | null, nonce: string, action: string, arg?: string) {
    if (!state || state.flow !== 'gasto' || state.nonce !== nonce) {
      return [{ text: t('Esse botão expirou. Use /lancamento para um novo lançamento.') }];
    }
    const { draft } = state;

    switch (action) {
      case 'cancel':
        await this.link.clearState(u.canal, u.externalUserId);
        return [{ text: t('Lançamento cancelado.') }];

      case 'save':
        return this.save(u, state);

      case 'additem':
        this.commitCurrentItemIfComplete(draft);
        draft.addingItem = true;
        draft.editingItemIndex = undefined;
        draft.nome = undefined;
        draft.categoria = undefined;
        draft.quantidade = undefined;
        draft.valorUnitario = undefined;
        return this.advance(u, draft);

      case 'cancelitem':
        draft.addingItem = false;
        draft.editingItemIndex = undefined;
        draft.nome = undefined;
        draft.categoria = undefined;
        draft.quantidade = undefined;
        draft.valorUnitario = undefined;
        return this.advance(u, draft);

      case 'rmitem': {
        const idx = Number(arg);
        const list = [...(draft.items ?? [])];
        if (Number.isInteger(idx) && idx >= 0 && idx < list.length && list.length > 1) {
          list.splice(idx, 1);
          draft.items = list;
        }
        return this.advance(u, draft);
      }

      case 'pick': {
        const id = state.options?.[Number(arg)];
        if (!id) return this.retry(u, state, t('Opção inválida.'));
        await this.applyOption(u.userId, state.step, draft, id);
        return this.advance(u, draft);
      }

      case 'tipo':
        draft.tipo = arg === 'PARCELADO' ? 'PARCELADO' : 'A_VISTA';
        draft.parcelas = draft.tipo === 'PARCELADO' ? undefined : 1;
        return this.advance(u, draft);

      case 'parc':
        draft.parcelas = Math.min(48, Math.max(2, Number(arg) || 2));
        return this.advance(u, draft);

      case 'qty':
        draft.quantidade = F.parseQuantity(arg ?? '') ?? 1;
        return this.advance(u, draft);

      case 'date':
        draft.data = arg === 'ontem' ? F.addDays(BillScheduleHelper.today(), -1) : BillScheduleHelper.today();
        return this.advance(u, draft);

      case 'edit':
        return this.edit(u, draft, arg as ExpenseStep);

      // Resumo: "Editar" troca os botões pela lista de campos; "Voltar" devolve o resumo
      case 'editmenu':
        return [this.editMenu(draft, state.nonce)];
      case 'review':
        return [{ ...this.summary(draft, state.nonce), replace: true }];

      // Item digitado não existe (ou botão ➕): cadastrar agora e voltar ao lançamento
      case 'new':
      case 'create': {
        if (!isRegistrable(state.step)) return this.retry(u, state, t('Opção inválida.'));
        const name = action === 'new' ? (state.pending ?? '') : '';
        return this.register.start(u, REGISTRABLE[state.step].form, name, { draft, step: state.step });
      }

      case 'back':
        return this.advance(u, draft, state.step);
    }
    return this.retry(u, state, t('Opção inválida.'));
  }

  /** Stateless: desfazer / excluir lançamentos. */
  async onStatelessCallback(u: BotUser, action: string, id?: string): Promise<BotReply[]> {
    if (!id && action !== 'keep') return [{ text: t('Opção inválida.') }];
    switch (action) {
      case 'undo': {
        const expense = await this.prisma.lancamento.findFirst({ where: { id, userId: u.userId } });
        if (!expense) return [{ text: t('Esse lançamento já não existe.') }];
        const batch = await this.prisma.lancamento.findMany({
          where: { userId: u.userId, codigo: expense.codigo },
        });
        const targets = batch.length > 0 ? batch : [expense];
        for (const item of targets) {
          await this.expenses.remove(u.userId, item.id);
        }
        if (targets.length > 1) {
          const total = targets.reduce((acc, it) => acc + Number(it.valorTotal), 0);
          return [{ text: t('🗑 Compra desfeita: <b>{n} itens</b> · {valor}', { n: targets.length, valor: F.brl(total) }) }];
        }
        return [{ text: t('🗑 Excluído: <b>{nome}</b> · {valor}', { nome: F.esc(expense.nome), valor: F.brl(expense.valorTotal) }) }];
      }
      case 'delok': {
        const expense = await this.prisma.lancamento.findFirst({ where: { id, userId: u.userId } });
        if (!expense) return [{ text: t('Esse lançamento já não existe.') }];
        await this.expenses.remove(u.userId, expense.id);
        return [{ text: t('🗑 Excluído: <b>{nome}</b> · {valor}', { nome: F.esc(expense.nome), valor: F.brl(expense.valorTotal) }) }];
      }
      case 'del': {
        const expense = await this.prisma.lancamento.findFirst({ where: { id, userId: u.userId } });
        if (!expense) return [{ text: t('Esse lançamento já não existe.') }];
        return [
          {
            text: t('Excluir <b>{nome}</b> · {valor} ({data})?', { nome: F.esc(expense.nome), valor: F.brl(expense.valorTotal), data: F.date(expense.data) }),
            buttons: [[
              { label: t('🗑 Sim, excluir'), data: `x::delok:${expense.id}` },
              { label: t('Não'), data: 'x::keep' },
            ]],
            noFollowUp: true,
          },
        ];
      }
      case 'keep':
        return [{ text: t('Ok, mantido.') }];
    }
    return [{ text: t('Opção inválida.') }];
  }

  /** `/ultimos`: 5 lançamentos mais recentes, com botão para excluir. */
  async recent(u: BotUser): Promise<BotReply[]> {
    const items = await this.prisma.lancamento.findMany({
      where: { userId: u.userId },
      include: { meioPagamento: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    if (!items.length) return [{ text: t('Você ainda não tem lançamentos.') }];

    const lines = items.map(
      (e, i) =>
        `${i + 1}. <b>${F.esc(e.nome)}</b> · ${F.brl(e.valorTotal)}\n    ${F.date(e.data)} · ${F.esc(e.loja)} · ${F.esc(e.meioPagamento.nome)} · ` +
        (e.numeroParcelas > 1 ? t('Parcelado {n}x', { n: e.numeroParcelas }) : t('À Vista')),
    );
    const buttons = items.map((e, i) => ({ label: `🗑 ${i + 1}`, data: `x::del:${e.id}` }));
    return [{ text: `${t('<b>Últimos lançamentos</b>')}\n\n${lines.join('\n')}`, buttons: [buttons] }];
  }

  // ---------------------------------------------------------------------------
  // Máquina de estados
  // ---------------------------------------------------------------------------

  private async advance(u: BotUser, draft: ExpenseDraft, forced?: ExpenseStep): Promise<BotReply[]> {
    const step = forced ?? this.firstMissing(draft);
    if (step === 'loja' && draft.lojaSugerida) {
      const name = draft.lojaSugerida;
      delete draft.lojaSugerida;
      return this.notRegistered(u, draft, 'loja', name);
    }
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

  /** Item digitado não existe: cadastrar agora ou escolher outro (no bot, tudo precisa estar cadastrado). */
  private async notRegistered(u: BotUser, draft: ExpenseDraft, step: RegistrableStep, typed: string): Promise<BotReply[]> {
    const r = REGISTRABLE[step];
    const name = typed.trim().slice(0, MAX_TEXT);
    const nonce = F.nonce();
    await this.link.setState(u.canal, u.externalUserId, { flow: 'gasto', nonce, step, draft, pending: name });
    const buttons: BotButton[][] = [
      [{ label: F.label(t(r.cadastrar), 32), data: `g:${nonce}:new` }],
      [{ label: `↩️ ${t(r.outro)}`, data: `g:${nonce}:back` }],
      [CANCEL(nonce)],
    ];
    return [{ text: `${t(r.missing, { nome: F.esc(name) })}\n${t('O que você quer fazer?')}`, buttons }];
  }

  /**
   * Quando os 4 campos do item atual estão preenchidos, move o item para `draft.items`
   * e limpa os campos temporários do item.
   */
  private commitCurrentItemIfComplete(d: ExpenseDraft): void {
    if (d.nome && d.categoria && d.quantidade && d.valorUnitario) {
      const item: ExpenseItemDraft = {
        nome: d.nome,
        categoria: d.categoria,
        quantidade: d.quantidade,
        valorUnitario: d.valorUnitario,
      };
      const list = [...(d.items ?? [])];
      if (d.editingItemIndex !== undefined && d.editingItemIndex >= 0 && d.editingItemIndex < list.length) {
        list[d.editingItemIndex] = item;
      } else {
        list.push(item);
      }
      d.items = list;
      d.nome = undefined;
      d.categoria = undefined;
      d.quantidade = undefined;
      d.valorUnitario = undefined;
      d.addingItem = false;
      d.editingItemIndex = undefined;
    }
  }

  /** Ordem da tela "Novo Lançamento": dados da compra e depois os itens. */
  private firstMissing(d: ExpenseDraft): ExpenseStep {
    if (!d.comprador) return 'comprador';
    if (!d.loja) return 'loja';
    if (!d.data) return 'data';
    if (!d.meioPagamentoId) return 'meio';
    if (!d.tipo) return 'tipo';
    if (d.tipo === 'PARCELADO' && !d.parcelas) return 'parcelas';

    this.commitCurrentItemIfComplete(d);

    const hasItems = (d.items?.length ?? 0) > 0;
    const fillingItem = !hasItems || d.addingItem || d.editingItemIndex !== undefined || !!(d.nome || d.categoria || d.quantidade || d.valorUnitario);

    if (fillingItem) {
      if (!d.nome) return 'nome';
      if (!d.categoria) return 'categoria';
      if (!d.quantidade) return 'quantidade';
      if (!d.valorUnitario) return 'valor';
    }

    return 'confirmar';
  }

  private edit(u: BotUser, d: ExpenseDraft, field: ExpenseStep): Promise<BotReply[]> {
    if (isItemStep(field) && (d.items?.length ?? 0) > 0 && d.editingItemIndex === undefined) {
      // Edita o último item adicionado à compra
      const idx = d.items!.length - 1;
      const target = d.items![idx];
      d.editingItemIndex = idx;
      d.nome = target.nome;
      d.categoria = target.categoria;
      d.quantidade = target.quantidade;
      d.valorUnitario = target.valorUnitario;
    }

    switch (field) {
      case 'comprador':
        d.comprador = undefined;
        d.compradorId = null;
        break;
      case 'loja':
        d.loja = undefined;
        d.lojaId = null;
        break;
      case 'data':
        d.data = undefined;
        break;
      case 'meio':
        d.meioPagamentoId = undefined;
        d.meioNome = undefined;
        d.modalidade = undefined;
        break;
      case 'tipo':
        d.tipo = undefined;
        d.parcelas = undefined;
        break;
      case 'nome':
        d.nome = undefined;
        break;
      case 'categoria':
        d.categoria = undefined;
        break;
      case 'quantidade':
        d.quantidade = undefined;
        break;
      case 'valor':
        d.valorUnitario = undefined;
        break;
    }
    return this.advance(u, d);
  }

  private applyMethod(d: ExpenseDraft, m: { id: string; nome: string; modalidade: ModalidadePagamento }) {
    d.meioPagamentoId = m.id;
    d.meioNome = m.nome;
    d.modalidade = m.modalidade;
  }

  /** Aplica a loja cadastrada com esse nome. Retorna false se ela não existir. */
  private async applyStoreText(userId: string, d: ExpenseDraft, text: string): Promise<boolean> {
    const name = text.trim().slice(0, MAX_TEXT);
    if (!name) return false;
    const store = await this.prisma.loja.findFirst({
      where: { userId, nome: { equals: name, mode: 'insensitive' } },
    });
    if (!store) return false;
    d.loja = store.nome;
    d.lojaId = store.id;
    return true;
  }

  private async applyOption(userId: string, step: ExpenseStep, d: ExpenseDraft, id: string) {
    switch (step) {
      case 'comprador': {
        const buyer = await this.prisma.comprador.findFirst({ where: { id, userId } });
        if (buyer) {
          d.comprador = buyer.nome;
          d.compradorId = buyer.id;
        }
        break;
      }
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
    if (step === 'confirmar') return { reply: this.summary(d, nonce) };

    const itemCount = d.items?.length ?? 0;
    const itemIndex = d.editingItemIndex !== undefined ? d.editingItemIndex + 1 : itemCount + 1;
    const itemTag = isItemStep(step) && (itemCount > 0 || d.editingItemIndex !== undefined)
      ? ` · <i>${t('Item #{n}', { n: itemIndex })}</i>`
      : '';
    const title = `📝 <b>${label(step)}</b>${itemTag}`;
    const cancelExtra: BotButton[][] =
      isItemStep(step) && itemCount > 0 && d.editingItemIndex === undefined
        ? [[{ label: t('↩️ Voltar ao resumo ({n})', { n: itemCount }), data: `g:${nonce}:cancelitem` }]]
        : [];

    const choose = async (hint: string, suggestion: Option | null, list: Option[], perRow = 2) => {
      const items = [
        ...(suggestion ? [{ ...suggestion, label: `⭐ ${suggestion.label}` }] : []),
        ...list.filter((o) => o.id !== suggestion?.id),
      ].slice(0, MAX_OPTIONS);
      const buttons = F.rows(
        items.map((it, i) => ({ label: F.label(it.label), data: `g:${nonce}:pick:${i}` })),
        perRow,
      );
      const create = isRegistrable(step) ? [[{ label: `➕ ${t(REGISTRABLE[step].novo)}`, data: `g:${nonce}:create` }]] : [];
      return {
        reply: {
          text: `${title}\n${items.length ? hint : t('Digite o nome.')}`,
          buttons: [...buttons, ...create, ...cancelExtra, [CANCEL(nonce)]],
        },
        options: items.map((i) => i.id),
      };
    };
    const ask = (hint: string, buttons: BotButton[][] = []) => ({
      reply: { text: `${title}\n${hint}`, buttons: [...buttons, ...cancelExtra, [CANCEL(nonce)]] },
    });

    switch (step) {
      case 'comprador': {
        const prefs = await this.preferences.getExpensePreferences(userId);
        const buyers = await this.prisma.comprador.findMany({ where: { userId, ativo: true }, orderBy: { nome: 'asc' } });
        const suggestion = prefs.compradorPadrao ? { id: prefs.compradorPadrao.id, label: prefs.compradorPadrao.nome } : null;
        return choose(t('Toque numa opção ou digite o nome.'), suggestion, buyers.map((b) => ({ id: b.id, label: b.nome })));
      }

      case 'loja': {
        const prefs = await this.preferences.getExpensePreferences(userId);
        const stores = await this.topStores(userId);
        const suggestion = prefs.lojaPadrao ? { id: prefs.lojaPadrao.id, label: prefs.lojaPadrao.nome } : null;
        return choose(t('Toque numa opção ou digite o nome.'), suggestion, stores.map((s) => ({ id: s.id, label: s.nome })));
      }

      case 'data':
        return ask(t('Toque numa opção ou digite <code>{dm}</code> ou <code>{dma}</code>.', { dm: F.datePattern(), dma: F.datePattern(true) }), [[
          { label: t('Hoje ({data})', { data: F.dayMonth(`${BillScheduleHelper.today()}T12:00:00`) }), data: `g:${nonce}:date:hoje` },
          { label: t('Ontem'), data: `g:${nonce}:date:ontem` },
        ]]);

      case 'meio': {
        const prefs = await this.preferences.getExpensePreferences(userId);
        const methods = await this.prisma.paymentMethod.findMany({ where: { userId, ativo: true }, orderBy: { nome: 'asc' } });
        const toOption = (m: { id: string; nome: string; modalidade: string }) => ({
          id: m.id,
          label: `${m.nome} · ${F.modalidade(m.modalidade)}`,
        });
        const suggestion = prefs.meioPagamentoPadrao ? toOption(prefs.meioPagamentoPadrao) : null;
        return choose(t('Toque numa opção ou digite o nome.'), suggestion, methods.map(toOption), 1);
      }

      case 'tipo':
        return ask(t('Toque numa opção.'), [[
          { label: t('À Vista'), data: `g:${nonce}:tipo:A_VISTA` },
          { label: t('Parcelado'), data: `g:${nonce}:tipo:PARCELADO` },
        ]]);

      case 'parcelas': {
        const buttons: BotButton[] = [];
        for (let n = 2; n <= 12; n++) buttons.push({ label: `${n}x`, data: `g:${nonce}:parc:${n}` });
        return ask(t('Toque numa opção ou digite (até 48).'), F.rows(buttons, 4));
      }

      case 'nome':
        return ask(t('Digite o nome do item.\n<i>Exemplo: Teclado Mecânico, Arroz 5kg, Remédio…</i>'));

      case 'categoria': {
        const [prefs, cats, usedAtStore] = await Promise.all([
          this.preferences.getExpensePreferences(userId),
          this.prisma.categoriaItem.findMany({ where: { userId, ativo: true }, orderBy: { nome: 'asc' } }),
          d.lojaId
            ? this.prisma.lancamento.groupBy({
                by: ['categoria'],
                where: { userId, lojaId: d.lojaId },
                _count: { categoria: true },
                orderBy: { _count: { categoria: 'desc' } },
                take: 5,
              })
            : [],
        ]);
        const active = new Set(cats.map((c) => c.nome));
        const lastAddedCat = d.items?.length ? d.items[d.items.length - 1].categoria : undefined;
        const suggested =
          (lastAddedCat && active.has(lastAddedCat) ? lastAddedCat : undefined) ??
          usedAtStore.map((g) => g.categoria).find((c) => active.has(c)) ??
          prefs.categoriaPadrao;
        return choose(
          t('Toque numa opção ou digite o nome.'),
          suggested ? { id: suggested, label: suggested } : null,
          cats.map((c) => ({ id: c.nome, label: c.nome })),
          3,
        );
      }

      case 'quantidade': {
        const buttons = [1, 2, 3, 4, 5, 6].map((n) => ({ label: String(n), data: `g:${nonce}:qty:${n}` }));
        return ask(t('Toque numa opção ou digite (aceita decimais, ex.: <code>1,5</code>).'), [buttons]);
      }

      case 'valor':
        return ask(
          d.quantidade && d.quantidade !== 1
            ? t('Digite o valor de cada unidade (quantidade: {qtd}).\n<i>Exemplo: {exemplo}</i>', { qtd: F.quantity(d.quantidade), exemplo: F.amountExample(45.9) })
            : t('Digite o valor.\n<i>Exemplo: {exemplo}</i>', { exemplo: F.amountExample(45.9) }),
        );
    }
  }

  private itemSubtotal(it: ExpenseItemDraft): number {
    return Number((it.quantidade * it.valorUnitario).toFixed(2));
  }

  private allItems(d: ExpenseDraft): ExpenseItemDraft[] {
    this.commitCurrentItemIfComplete(d);
    return d.items ?? [];
  }

  private grandTotal(d: ExpenseDraft): number {
    return Number(
      this.allItems(d)
        .reduce((acc, it) => acc + this.itemSubtotal(it), 0)
        .toFixed(2),
    );
  }

  private summary(d: ExpenseDraft, nonce: string): BotReply {
    const items = this.allItems(d);
    const total = this.grandTotal(d);
    const tipo =
      d.tipo === 'PARCELADO'
        ? t('Parcelado em {n}x de {valor}', { n: d.parcelas, valor: F.brl(Math.round((total / d.parcelas!) * 100) / 100) })
        : t('À Vista');
    const line = (lbl: string, value: string) => `<b>${lbl}:</b> ${value}`;

    const itemLines = items.map((it, idx) => {
      const sub = this.itemSubtotal(it);
      const qtyDetail = it.quantidade !== 1 ? `${F.quantity(it.quantidade)} × ${F.brl(it.valorUnitario)} = ` : '';
      return `${idx + 1}. <b>${F.esc(it.nome)}</b> (${F.esc(it.categoria)})\n    ${qtyDetail}<b>${F.brl(sub)}</b>`;
    });

    const text = [
      t('📝 <b>Confirma o lançamento?</b>'),
      '',
      line(label('comprador'), F.esc(d.comprador)),
      line(label('loja'), F.esc(d.loja)),
      line(label('data'), F.date(d.data!)),
      line(label('meio'), `${F.esc(d.meioNome)} · ${F.modalidade(d.modalidade)}`),
      line(label('tipo'), tipo),
      '',
      `<b>${t('Itens na Compra:')}</b> (${items.length})`,
      ...itemLines,
      '',
      line(t('Valor Total'), `<b>${F.brl(total)}</b>`),
      '',
      t('<i>Quer adicionar outro item a esta compra ou finalizar?</i>'),
    ].join('\n');

    return {
      text,
      buttons: [
        [{ label: t('➕ Adicionar outro item'), data: `g:${nonce}:additem` }],
        [{ label: t('✅ Finalizar compra'), data: `g:${nonce}:save` }, { label: t('✏️ Editar'), data: `g:${nonce}:editmenu` }],
        [CANCEL(nonce)],
      ],
    };
  }

  /** Mesmo resumo, com a lista de campos que podem ser alterados no lugar dos botões. */
  private editMenu(d: ExpenseDraft, nonce: string): BotReply {
    const edit = (lbl: string, field: ExpenseStep): BotButton => ({ label: lbl, data: `g:${nonce}:edit:${field}` });
    const items = this.allItems(d);
    const removeRow: BotButton[][] =
      items.length > 1
        ? F.rows(
            items.map((it, i) => ({
              label: F.label(`🗑 #${i + 1} ${it.nome}`, 24),
              data: `g:${nonce}:rmitem:${i}`,
            })),
            2,
          )
        : [];

    return {
      text: `${this.summary(d, nonce).text}\n\n${t('<i>Qual campo você quer alterar?</i>')}`,
      replace: true,
      buttons: [
        [edit(t('Comprador'), 'comprador'), edit(t('Loja'), 'loja'), edit(t('Data'), 'data')],
        [edit(t('Meio de Pagamento'), 'meio'), edit(t('Tipo'), 'tipo')],
        [edit(t('Nome'), 'nome'), edit(t('Categoria'), 'categoria')],
        [edit(t('Quantidade'), 'quantidade'), edit(t('Valor Unitário'), 'valor')],
        ...removeRow,
        [{ label: t('↩️ Voltar'), data: `g:${nonce}:review` }],
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
      take: MAX_OPTIONS,
    });
    const ids = used.map((u) => u.lojaId!) as string[];
    const top = await this.prisma.loja.findMany({ where: { userId, id: { in: ids } } });
    const ordered = ids.map((id) => top.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);
    if (ordered.length < MAX_OPTIONS) {
      const rest = await this.prisma.loja.findMany({
        where: { userId, id: { notIn: ids } },
        orderBy: { nome: 'asc' },
        take: MAX_OPTIONS - ordered.length,
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

    const items = this.allItems(d);
    if (!items.length) return this.advance(u, d);

    // Só quem consumir o estado grava (clique duplo / update reenviado)
    if (!(await this.link.consumeState(u.canal, u.externalUserId, state.nonce))) {
      return [{ text: t('Esse lançamento já foi processado.') }];
    }

    const parcelas = d.tipo === 'PARCELADO' ? d.parcelas! : 1;
    const batchCode = randomUUID();
    const createdList = [];

    for (const it of items) {
      const created = await this.expenses.create(
        u.userId,
        {
          codigo: batchCode,
          comprador: d.comprador!,
          compradorId: d.compradorId ?? undefined,
          loja: d.loja!,
          lojaId: d.lojaId ?? undefined,
          data: d.data!,
          meioPagamentoId: d.meioPagamentoId!,
          tipo: d.tipo === 'PARCELADO' ? TipoLancamento.PARCELADO : TipoLancamento.A_VISTA,
          numeroParcelas: parcelas,
          nome: it.nome,
          categoria: it.categoria,
          quantidade: it.quantidade,
          valorUnitario: it.valorUnitario,
          valorTotal: this.itemSubtotal(it),
        },
        OrigemLancamento.TELEGRAM,
      );
      createdList.push(created);
    }

    const firstExpense = createdList[0];
    const firstInstallment = firstExpense.parcelas[0];
    const total = createdList.reduce((acc, c) => acc + Number(c.valorTotal), 0);
    const totalParcela = createdList.reduce((acc, c) => acc + Number(c.parcelas[0]?.valor ?? 0), 0);
    const tipo =
      parcelas > 1
        ? t('Parcelado em {n}x de {valor}', { n: parcelas, valor: F.brl(totalParcela) })
        : t('À Vista');
    const invoice =
      firstExpense.meioPagamento.modalidade === ModalidadePagamento.CREDITO && firstInstallment
        ? t(' · 1ª na fatura de {mes}', { mes: F.monthName(firstInstallment.mesReferencia).toLowerCase() })
        : '';

    const itemLines =
      createdList.length === 1
        ? [`<b>${F.esc(firstExpense.nome)}</b> · ${F.brl(firstExpense.valorTotal)}`]
        : [
            ...createdList.map((c, idx) => `${idx + 1}. <b>${F.esc(c.nome)}</b> · ${F.brl(c.valorTotal)}`),
            `<b>${t('Valor Total')}:</b> <b>${F.brl(total)}</b>`,
          ];

    const reply = this.withSiteLink(
      [
        createdList.length > 1
          ? t('✅ <b>Compra lançada! ({n} itens)</b>', { n: createdList.length })
          : t('✅ <b>Lançado!</b>'),
        ...itemLines,
        `${F.esc(firstExpense.loja)} · ${F.date(firstExpense.data)}`,
        `${F.esc(firstExpense.meioPagamento.nome)} · ${tipo}${invoice}`,
      ].join('\n'),
      '/expenses',
    );
    reply.buttons = [[{ label: t('↩️ Desfazer'), data: `x::undo:${firstExpense.id}` }, ...(reply.buttons?.[0] ?? [])]];
    return [reply];
  }

  /** Botão "Ver no site" só com URL https (o Telegram recusa localhost/http). */
  private withSiteLink(text: string, path: string): BotReply {
    const base = this.config.get<string>('FRONTEND_URL', '');
    if (!base.startsWith('https://')) return { text };
    return { text, buttons: [[{ label: t('🌐 Ver no site'), url: `${base.replace(/\/$/, '')}${path}` }]] };
  }
}
