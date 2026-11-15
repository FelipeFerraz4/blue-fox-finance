import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../../../prisma/prisma.service';
import { StoresService } from '../../stores/stores.service';
import { BuyersService } from '../../buyers/buyers.service';
import { PaymentMethodsService } from '../../payment-methods/payment-methods.service';
import { CategoriesService } from '../../categories/categories.service';
import { BillsService } from '../../bills/bills.service';
import { BillScheduleHelper } from '../../../common/helpers/bill-schedule.helper';
import { BotLinkService } from '../bot-link.service';
import { BotFormat as F } from '../bot-format';
import { BotButton, BotReply, BotUser, ConversationState, ExpenseDraft, FormKind, RegistrableStep } from '../bot.types';
import { ExpenseFlow } from './expense.flow';
import { FieldSpec, FieldValue, FORM_MENU, FORMS, FormSpec, Option, Values } from './register.forms';
import { t, translateMessage } from '../../../common/i18n/translate';

type CadastroState = Extract<ConversationState, { flow: 'cadastro' }>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_OPTIONS = 12;

/**
 * Cadastros pelo chat (loja, comprador, meio de pagamento, categorias, conta a
 * pagar): um motor genérico percorre os campos de `FORMS`, mostra o resumo e
 * grava pelos mesmos services do site, validando com os mesmos DTOs.
 * Callbacks com estado: `f:<nonce>:<ação>:<arg>`. Menu: `r::<tipo>`.
 */
@Injectable()
export class RegisterFlow {
  constructor(
    private readonly prisma: PrismaService,
    private readonly link: BotLinkService,
    private readonly stores: StoresService,
    private readonly buyers: BuyersService,
    private readonly paymentMethods: PaymentMethodsService,
    private readonly categories: CategoriesService,
    private readonly bills: BillsService,
    @Inject(forwardRef(() => ExpenseFlow))
    private readonly expense: ExpenseFlow,
  ) {}

  /** `/cadastrar`: escolhe o que cadastrar. */
  menu(): BotReply[] {
    return [
      {
        text: t('<b>O que você quer cadastrar?</b>'),
        buttons: F.rows(
          FORM_MENU.map((m) => ({ label: t(m.label), data: `r::${m.kind}` })),
          2,
        ),
        noFollowUp: true,
      },
    ];
  }

  /**
   * `resume`: cadastro aberto no meio de um lançamento (item digitado que não existia
   * ou botão ➕). Ao salvar, volta ao lançamento com o item escolhido; ao cancelar,
   * volta para a mesma pergunta.
   */
  async start(
    u: BotUser,
    kind: FormKind,
    firstText?: string,
    resume?: { draft: ExpenseDraft; step: RegistrableStep },
  ): Promise<BotReply[]> {
    const state: CadastroState = { flow: 'cadastro', nonce: '', form: kind, step: '', values: {}, labels: {}, answered: [], resume };
    // Ex.: "/novaloja Padaria Sol" já responde o nome (em Conta, o Cartão continua sendo perguntado antes)
    const nameField = FORMS[kind].fields.find((f) => f.key === 'nome');
    if (firstText?.trim() && nameField) this.apply(state, nameField, firstText);
    // O nome do cadastro aparece só na primeira pergunta; as demais trazem só a pergunta
    const intro = `🗂 <i>${t(FORMS[kind].title)}${resume ? t(' · ao salvar, volta ao lançamento') : ''}</i>`;
    return F.withIntro(await this.advance(u, state), intro);
  }

  async onText(u: BotUser, state: CadastroState, text: string): Promise<BotReply[]> {
    const field = this.field(state);
    if (!field) return this.retry(u, state, t('Use os botões para salvar, cancelar ou alterar.'));
    const value = text.trim();

    if (field.type === 'choice' || field.type === 'month') {
      // Aceita digitar o nome de uma opção (ou texto livre, se o campo permitir)
      const choices = await this.choices(u.userId, field);
      const match = choices.find((c) => c.label.toLowerCase() === value.toLowerCase() || c.id === value);
      if (match) {
        this.apply(state, field, match.id, match.label);
      } else if (field.parseText?.(value)) {
        const parsed = field.parseText(value)!;
        this.apply(state, field, parsed.id, parsed.label);
      } else if (field.allowText && value) {
        this.apply(state, field, value.slice(0, 120));
      } else if (field.type === 'month' && /^\d{1,2}$/.test(value) && +value >= 1 && +value <= 12) {
        this.apply(state, field, value, choices[+value - 1]?.label);
      } else {
        return this.retry(u, state, t(field.invalidText ?? 'Toque numa das opções.'));
      }
      return this.advance(u, state);
    }

    const error = this.apply(state, field, value);
    if (error) return this.retry(u, state, error);
    return this.advance(u, state);
  }

  async onCallback(u: BotUser, state: ConversationState | null, nonce: string, action: string, arg?: string) {
    if (!state || state.flow !== 'cadastro' || state.nonce !== nonce) {
      return [{ text: t('Esse botão expirou. Use /cadastrar para começar de novo.') }];
    }
    const field = this.field(state);

    switch (action) {
      case 'cancel':
        if (state.resume) {
          return [{ text: t('Cadastro cancelado. Voltando ao lançamento.') }, ...(await this.expense.backTo(u, state.resume.draft, state.resume.step))];
        }
        await this.link.clearState(u.canal, u.externalUserId);
        return [{ text: t('Cadastro cancelado.') }];

      case 'save':
        return this.save(u, state);

      // Resumo: "Editar" troca os botões pela lista de campos; "Voltar" devolve o resumo
      case 'editmenu':
        return [this.editMenu(state)];
      case 'review':
        return [{ ...this.summary(state), replace: true }];

      case 'edit': {
        const target = FORMS[state.form].fields.find((f) => f.key === arg);
        if (!target) return this.retry(u, state, t('Opção inválida.'));
        state.answered = state.answered.filter((k) => k !== target.key);
        delete state.values[target.key];
        delete state.labels[target.key];
        return this.advance(u, state);
      }

      case 'skip':
        if (!field || field.required) return this.retry(u, state, t('Esse campo é obrigatório.'));
        this.apply(state, field, null);
        return this.advance(u, state);

      case 'pick': {
        const id = state.options?.[Number(arg)];
        if (!field || id === undefined) return this.retry(u, state, t('Opção inválida.'));
        const label = (await this.choices(u.userId, field)).find((c) => c.id === id)?.label;
        if (field.type === 'choice' || field.type === 'month') {
          this.apply(state, field, id, label);
        } else {
          const error = this.apply(state, field, id);
          if (error) return this.retry(u, state, error);
        }
        return this.advance(u, state);
      }
    }
    return this.retry(u, state, t('Opção inválida.'));
  }

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------

  private visibleFields(spec: FormSpec, values: Values) {
    return spec.fields.filter((f) => !f.visible || f.visible(values));
  }

  /** Próximo campo visível ainda não respondido (null = resumo). */
  private nextField(state: CadastroState): FieldSpec | null {
    return this.visibleFields(FORMS[state.form], state.values).find((f) => !state.answered.includes(f.key)) ?? null;
  }

  private field(state: CadastroState): FieldSpec | null {
    return FORMS[state.form].fields.find((f) => f.key === state.step) ?? null;
  }

  /** Valida e grava a resposta. Retorna a mensagem de erro, se houver. */
  private apply(state: CadastroState, field: FieldSpec, raw: FieldValue, label?: string): string | null {
    let value: FieldValue = raw;
    if (raw !== null && field.type !== 'choice') {
      const text = String(raw).trim();
      switch (field.type) {
        case 'text':
          if (!text) return t('Digite {campo}.', { campo: t(field.label).toLowerCase() });
          value = text.slice(0, field.maxLength ?? 120);
          break;
        case 'email':
          if (!EMAIL.test(text)) return t('E-mail inválido. Exemplo: <code>nome@email.com</code>');
          value = text.toLowerCase();
          break;
        case 'day':
        case 'month':
        case 'int': {
          const [min, max] = field.type === 'day' ? [1, 31] : field.type === 'month' ? [1, 12] : [field.min ?? 0, field.max ?? 9999];
          const n = Number(text);
          if (!Number.isInteger(n) || n < min || n > max) return t('Digite um número de {min} a {max}.', { min, max });
          value = field.type === 'month' ? String(n) : n;
          break;
        }
        case 'money': {
          const n = F.parseAmount(text);
          if (n === null) return t('Valor inválido. Exemplo: <code>120,50</code>');
          value = n;
          break;
        }
        case 'date': {
          const d = F.parseDate(text, BillScheduleHelper.today());
          if (!d) return t('Data inválida. Use <code>{dm}</code> ou <code>{dma}</code>.', { dm: F.datePattern(), dma: F.datePattern(true) });
          value = d;
          break;
        }
        case 'monthYear': {
          const m = /^(\d{1,2})[/.-](\d{4})$/.exec(text);
          if (!m || +m[1] < 1 || +m[1] > 12) return t('Use <code>mm/aaaa</code>, por exemplo <code>01/2027</code>.');
          value = `${m[2]}-${m[1].padStart(2, '0')}-01`;
          break;
        }
      }
    }
    state.values[field.key] = value;
    if (label) state.labels[field.key] = label;
    else delete state.labels[field.key];
    if (!state.answered.includes(field.key)) state.answered.push(field.key);
    return null;
  }

  private async advance(u: BotUser, state: CadastroState): Promise<BotReply[]> {
    // Campo que ficou escondido (ex.: modalidade deixou de ser crédito) perde a resposta:
    // se voltar a aparecer, é perguntado de novo
    const visible = new Set(this.visibleFields(FORMS[state.form], state.values).map((f) => f.key));
    for (const key of [...state.answered]) {
      if (!visible.has(key)) {
        state.answered = state.answered.filter((k) => k !== key);
        delete state.values[key];
        delete state.labels[key];
      }
    }

    // Campo opcional de escolha sem nenhuma opção (ex.: nenhum cartão de crédito): pula sozinho
    let field = this.nextField(state);
    while (field && field.type === 'choice' && !field.required && !field.allowText && !(await this.choices(u.userId, field)).length) {
      this.apply(state, field, null);
      field = this.nextField(state);
    }

    state.nonce = F.nonce();
    state.step = field?.key ?? '';
    const { reply, options } = field ? await this.prompt(u.userId, state, field) : { reply: this.summary(state), options: undefined };
    state.options = options;
    await this.link.setState(u.canal, u.externalUserId, state);
    return [reply];
  }

  private async retry(u: BotUser, state: CadastroState, message: string): Promise<BotReply[]> {
    return [{ text: message }, ...(await this.advance(u, state))];
  }

  private async choices(userId: string, field: FieldSpec): Promise<Option[]> {
    return field.choices ? (await field.choices(userId, this.prisma)).slice(0, MAX_OPTIONS) : [];
  }

  // ---------------------------------------------------------------------------
  // Mensagens
  // ---------------------------------------------------------------------------

  private async prompt(userId: string, state: CadastroState, field: FieldSpec) {
    const spec = FORMS[state.form];
    const n = state.nonce;
    const hint = field.hint ? t(field.hint) : this.defaultHint(field);
    const text = `🗂 <b>${t(field.label)}</b>${field.required ? '' : t(' <i>(opcional)</i>')}${hint ? `\n${hint}` : ''}`;

    const choices = await this.choices(userId, field);
    const quick = field.quick?.(BillScheduleHelper.today()) ?? [];
    const options = [...choices, ...quick].map((o) => o.id);
    const perRow = field.perRow ?? (field.type === 'month' ? 3 : choices.length > 6 ? 2 : 1);

    const buttons: BotButton[][] = [
      ...F.rows(
        choices.map((c, i) => ({ label: F.label(c.label, 30), data: `f:${n}:pick:${i}` })),
        perRow,
      ),
      ...(quick.length ? [quick.map((q, i) => ({ label: q.label, data: `f:${n}:pick:${choices.length + i}` }))] : []),
      ...(field.required ? [] : [[{ label: `⏭ ${t(field.skipLabel ?? 'Pular')}`, data: `f:${n}:skip` }]]),
      [{ label: t('❌ Cancelar'), data: `f:${n}:cancel` }],
    ];
    return { reply: { text, buttons }, options };
  }

  private defaultHint(field: FieldSpec): string {
    switch (field.type) {
      case 'email':
        return t('Digite o e-mail.');
      case 'day':
        return t('Digite um dia de 1 a 31.');
      case 'month':
        return t('Toque no mês.');
      case 'date':
        return t('Digite <code>{dm}</code> ou <code>{dma}</code>.', { dm: F.datePattern(), dma: F.datePattern(true) });
      case 'money':
        return t('Digite o valor. Exemplo: <code>{exemplo}</code>', { exemplo: F.amountExample() });
      case 'int':
        return t('Digite um número de {min} a {max}.', { min: field.min ?? 0, max: field.max ?? 9999 });
      case 'choice':
        return field.allowText ? t('Toque numa opção ou digite.') : t('Toque numa opção.');
      default:
        return '';
    }
  }

  private display(state: CadastroState, field: FieldSpec): string {
    const v = state.values[field.key];
    if (v === null || v === undefined || v === '') return field.skipLabel && !field.required ? t(field.skipLabel) : '—';
    if (state.labels[field.key]) return F.esc(state.labels[field.key]);
    switch (field.type) {
      case 'money':
        return F.brl(Number(v));
      case 'date':
        return F.date(String(v));
      case 'monthYear':
        return F.date(String(v)).slice(3);
      default:
        return F.esc(String(v));
    }
  }

  private summary(state: CadastroState): BotReply {
    const spec = FORMS[state.form];
    const fields = this.visibleFields(spec, state.values);
    const n = state.nonce;
    const text = [
      `${t('🗂 <b>Confirma o cadastro?</b>')} · ${t(spec.title)}`,
      '',
      ...fields.map((f) => `<b>${t(f.label)}:</b> ${this.display(state, f)}`),
    ].join('\n');
    return {
      text,
      buttons: [
        [
          { label: t('✅ Salvar'), data: `f:${n}:save` },
          { label: t('✏️ Editar'), data: `f:${n}:editmenu` },
        ],
        [{ label: t('❌ Cancelar'), data: `f:${n}:cancel` }],
      ],
    };
  }

  /** Mesmo resumo, com a lista de campos que podem ser alterados no lugar dos botões. */
  private editMenu(state: CadastroState): BotReply {
    const fields = this.visibleFields(FORMS[state.form], state.values);
    const n = state.nonce;
    return {
      text: `${this.summary(state).text}\n\n${t('<i>Qual campo você quer alterar?</i>')}`,
      replace: true,
      buttons: [
        ...F.rows(
          fields.map((f) => ({ label: t(f.short ?? f.label), data: `f:${n}:edit:${f.key}` })),
          3,
        ),
        [{ label: t('↩️ Voltar'), data: `f:${n}:review` }],
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // Gravação
  // ---------------------------------------------------------------------------

  private async save(u: BotUser, state: CadastroState): Promise<BotReply[]> {
    if (this.nextField(state)) return this.advance(u, state);
    const spec = FORMS[state.form];
    const payload = spec.toDto(state.values);

    // Mesmas regras da API (o ValidationPipe não passa por aqui)
    const errors = await validate(plainToInstance(spec.dto, payload) as object);
    if (errors.length) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      return this.retry(u, state, `⚠️ ${F.esc(messages.map((m) => translateMessage(m)).join('; '))}`);
    }

    // Só quem consumir o estado grava (clique duplo / update reenviado)
    if (!(await this.link.consumeState(u.canal, u.externalUserId, state.nonce))) {
      return [{ text: t('Esse cadastro já foi processado.') }];
    }

    let created: { id: string; nome: string; modalidade?: unknown };
    try {
      created = await this.persist(u.userId, state.form, payload);
    } catch (err) {
      if (err instanceof HttpException) {
        // Ex.: nome repetido. Volta ao resumo para corrigir, sem perder o que foi digitado
        const response = err.getResponse();
        const message = typeof response === 'string' ? response : (response as { message?: string | string[] }).message;
        const list = Array.isArray(message) ? message : [message ?? err.message];
        return this.retry(u, state, `⚠️ ${F.esc(list.map((m) => translateMessage(String(m))).join('; '))}`);
      }
      throw err;
    }

    const fields = this.visibleFields(spec, state.values).filter((f) => f.key !== 'nome');
    const details = fields
      .filter((f) => state.values[f.key] !== null && state.values[f.key] !== undefined && state.values[f.key] !== '')
      .map((f) => `${t(f.label)}: ${this.display(state, f)}`);
    const done: BotReply = { text: [`✅ ${t(spec.doneLabel)}: <b>${F.esc(String(state.values.nome))}</b>`, ...details].join('\n') };
    if (state.resume) {
      // Volta ao lançamento já com o item recém-cadastrado escolhido
      return [done, ...(await this.expense.resume(u, state.resume.draft, state.resume.step, created))];
    }
    return [done];
  }

  private persist(userId: string, kind: FormKind, payload: Record<string, unknown>): Promise<{ id: string; nome: string; modalidade?: unknown }> {
    switch (kind) {
      case 'loja':
        return this.stores.create(userId, payload as never);
      case 'comprador':
        return this.buyers.create(userId, payload as never);
      case 'meio':
        return this.paymentMethods.create(userId, payload as never);
      case 'categoria-item':
        return this.categories.createItemCategory(userId, payload as never);
      case 'categoria-loja':
        return this.categories.createStoreCategory(userId, payload as never);
      case 'conta':
        return this.bills.create(userId, payload as never);
    }
  }
}
