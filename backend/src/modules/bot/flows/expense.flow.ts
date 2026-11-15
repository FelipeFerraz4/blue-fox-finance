import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModalidadePagamento, OrigemLancamento, TipoLancamento } from '@prisma/client';
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
 * mesmos nomes da tela "Novo Lançamento". Os padrões do perfil aparecem como
 * primeira opção (⭐), mas nada é preenchido sem o usuário escolher.
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
    const draft: ExpenseDraft = {};
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
        return this.retry(u, state, t('Use os botões para salvar, cancelar ou alterar.'));
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
      case 'undo':
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
    // Tudo no lançamento precisa estar cadastrado: cadastrar agora ou escolher outro
    const buttons: BotButton[][] = [
      [{ label: F.label(t(r.cadastrar), 32), data: `g:${nonce}:new` }],
      [{ label: `↩️ ${t(r.outro)}`, data: `g:${nonce}:back` }],
      [CANCEL(nonce)],
    ];
    return [{ text: `${t(r.missing, { nome: F.esc(name) })}\n${t('O que você quer fazer?')}`, buttons }];
  }

  /** Ordem da tela "Novo Lançamento": dados da compra e depois o item. */
  private firstMissing(d: ExpenseDraft): ExpenseStep {
    if (!d.comprador) return 'comprador';
    if (!d.loja) return 'loja';
    if (!d.data) return 'data';
    if (!d.meioPagamentoId) return 'meio';
    if (!d.tipo) return 'tipo';
    if (d.tipo === 'PARCELADO' && !d.parcelas) return 'parcelas';
    if (!d.nome) return 'nome';
    if (!d.categoria) return 'categoria';
    if (!d.quantidade) return 'quantidade';
    if (!d.valorUnitario) return 'valor';
    return 'confirmar';
  }

  private edit(u: BotUser, d: ExpenseDraft, field: ExpenseStep): Promise<BotReply[]> {
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
    // Os ids vêm do próprio estado, mas a consulta continua filtrando por userId
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

    const title = `📝 <b>${label(step)}</b>`;
    const choose = async (hint: string, suggestion: Option | null, list: Option[], perRow = 2) => {
      // Sugestão (padrão do perfil) primeiro, marcada com ⭐; sem repetir na lista
      const items = [
        ...(suggestion ? [{ ...suggestion, label: `⭐ ${suggestion.label}` }] : []),
        ...list.filter((o) => o.id !== suggestion?.id),
      ].slice(0, MAX_OPTIONS);
      const buttons = F.rows(
        items.map((it, i) => ({ label: F.label(it.label), data: `g:${nonce}:pick:${i}` })),
        perRow,
      );
      // Cadastrar um item novo sem sair do lançamento
      const create = isRegistrable(step) ? [[{ label: `➕ ${t(REGISTRABLE[step].novo)}`, data: `g:${nonce}:create` }]] : [];
      return {
        reply: {
          // Sem opções para tocar: só a parte do "digite"
          text: `${title}\n${items.length ? hint : t('Digite o nome.')}`,
          buttons: [...buttons, ...create, [CANCEL(nonce)]],
        },
        options: items.map((i) => i.id),
      };
    };
    const ask = (hint: string, buttons: BotButton[][] = []) => ({
      reply: { text: `${title}\n${hint}`, buttons: [...buttons, [CANCEL(nonce)]] },
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
        // Sugestão ⭐: a categoria de item mais usada nesta loja; senão a padrão do perfil.
        // A categoria da loja (ex.: E-commerce) é de outra lista e não serve para o item.
        const active = new Set(cats.map((c) => c.nome));
        const suggested = usedAtStore.map((g) => g.categoria).find((c) => active.has(c)) ?? prefs.categoriaPadrao;
        // Para categoria, a "opção" guardada é o próprio nome (Lancamento.categoria é texto)
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

  private total(d: ExpenseDraft): number {
    // Mesmo cálculo do ExpensesService quando o total não é informado
    return Number(((d.quantidade ?? 1) * (d.valorUnitario ?? 0)).toFixed(2));
  }

  private summary(d: ExpenseDraft, nonce: string): BotReply {
    const total = this.total(d);
    const tipo =
      d.tipo === 'PARCELADO'
        ? t('Parcelado em {n}x de {valor}', { n: d.parcelas, valor: F.brl(Math.round((total / d.parcelas!) * 100) / 100) })
        : t('À Vista');
    const line = (label: string, value: string) => `<b>${label}:</b> ${value}`;
    const text = [
      t('📝 <b>Confirma o lançamento?</b>'),
      '',
      line(label('comprador'), F.esc(d.comprador)),
      line(label('loja'), F.esc(d.loja)),
      line(label('data'), F.date(d.data!)),
      line(label('meio'), `${F.esc(d.meioNome)} · ${F.modalidade(d.modalidade)}`),
      line(label('tipo'), tipo),
      '',
      line(label('nome'), F.esc(d.nome)),
      line(label('categoria'), F.esc(d.categoria)),
      line(label('quantidade'), F.quantity(d.quantidade!)),
      line(t('Valor Unitário'), F.brl(d.valorUnitario!)),
      line(t('Valor Total'), `<b>${F.brl(total)}</b>`),
    ].join('\n');

    return {
      text,
      buttons: [
        [{ label: t('✅ Salvar'), data: `g:${nonce}:save` }, { label: t('✏️ Editar'), data: `g:${nonce}:editmenu` }],
        [CANCEL(nonce)],
      ],
    };
  }

  /** Mesmo resumo, com a lista de campos que podem ser alterados no lugar dos botões. */
  private editMenu(d: ExpenseDraft, nonce: string): BotReply {
    const edit = (label: string, field: ExpenseStep): BotButton => ({ label, data: `g:${nonce}:edit:${field}` });
    return {
      text: `${this.summary(d, nonce).text}\n\n${t('<i>Qual campo você quer alterar?</i>')}`,
      replace: true,
      buttons: [
        [edit(t('Comprador'), 'comprador'), edit(t('Loja'), 'loja'), edit(t('Data'), 'data')],
        [edit(t('Meio de Pagamento'), 'meio'), edit(t('Tipo'), 'tipo')],
        [edit(t('Nome'), 'nome'), edit(t('Categoria'), 'categoria')],
        [edit(t('Quantidade'), 'quantidade'), edit(t('Valor Unitário'), 'valor')],
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

    // Só quem consumir o estado grava (clique duplo / update reenviado)
    if (!(await this.link.consumeState(u.canal, u.externalUserId, state.nonce))) {
      return [{ text: t('Esse lançamento já foi processado.') }];
    }

    const parcelas = d.tipo === 'PARCELADO' ? d.parcelas! : 1;
    // Mesmo payload que a tela "Novo Lançamento" envia
    const created = await this.expenses.create(
      u.userId,
      {
        comprador: d.comprador!,
        compradorId: d.compradorId ?? undefined,
        loja: d.loja!,
        lojaId: d.lojaId ?? undefined,
        data: d.data!,
        meioPagamentoId: d.meioPagamentoId!,
        tipo: d.tipo === 'PARCELADO' ? TipoLancamento.PARCELADO : TipoLancamento.A_VISTA,
        numeroParcelas: parcelas,
        nome: d.nome!,
        categoria: d.categoria!,
        quantidade: d.quantidade!,
        valorUnitario: d.valorUnitario!,
        valorTotal: this.total(d),
      },
      OrigemLancamento.TELEGRAM,
    );

    const first = created.parcelas[0];
    const tipo = parcelas > 1 ? t('Parcelado em {n}x de {valor}', { n: parcelas, valor: F.brl(first.valor) }) : t('À Vista');
    const invoice =
      created.meioPagamento.modalidade === ModalidadePagamento.CREDITO && first
        ? t(' · 1ª na fatura de {mes}', { mes: F.monthName(first.mesReferencia).toLowerCase() })
        : '';

    const reply = this.withSiteLink(
      [
        t('✅ <b>Lançado!</b>'),
        `<b>${F.esc(created.nome)}</b> · ${F.brl(created.valorTotal)}`,
        `${F.esc(created.loja)} · ${F.date(created.data)}`,
        `${F.esc(created.meioPagamento.nome)} · ${tipo}${invoice}`,
      ].join('\n'),
      '/expenses',
    );
    reply.buttons = [[{ label: t('↩️ Desfazer'), data: `x::undo:${created.id}` }, ...(reply.buttons?.[0] ?? [])]];
    return [reply];
  }

  /** Botão "Ver no site" só com URL https (o Telegram recusa localhost/http). */
  private withSiteLink(text: string, path: string): BotReply {
    const base = this.config.get<string>('FRONTEND_URL', '');
    if (!base.startsWith('https://')) return { text };
    return { text, buttons: [[{ label: t('🌐 Ver no site'), url: `${base.replace(/\/$/, '')}${path}` }]] };
  }
}
