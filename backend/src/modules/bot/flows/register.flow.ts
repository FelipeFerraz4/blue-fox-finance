import { HttpException, Injectable } from '@nestjs/common';
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
import { BotButton, BotReply, BotUser, ConversationState, FormKind } from '../bot.types';
import { FieldSpec, FieldValue, FORM_MENU, FORMS, FormSpec, Option, Values } from './register.forms';

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
  ) {}

  /** `/cadastrar`: escolhe o que cadastrar. */
  menu(): BotReply[] {
    return [
      {
        text: '<b>O que você quer cadastrar?</b>',
        buttons: F.rows(
          FORM_MENU.map((m) => ({ label: m.label, data: `r::${m.kind}` })),
          2,
        ),
      },
    ];
  }

  async start(u: BotUser, kind: FormKind, firstText?: string): Promise<BotReply[]> {
    const state: CadastroState = { flow: 'cadastro', nonce: '', form: kind, step: '', values: {}, labels: {}, answered: [] };
    // Ex.: "/novaloja Padaria Sol" já responde o nome (em Conta, o Cartão continua sendo perguntado antes)
    const nameField = FORMS[kind].fields.find((f) => f.key === 'nome');
    if (firstText?.trim() && nameField) this.apply(state, nameField, firstText);
    return this.advance(u, state);
  }

  async onText(u: BotUser, state: CadastroState, text: string): Promise<BotReply[]> {
    const field = this.field(state);
    if (!field) return this.retry(u, state, 'Use os botões para salvar, cancelar ou alterar.');
    const value = text.trim();

    if (field.type === 'choice' || field.type === 'month') {
      // Aceita digitar o nome de uma opção (ou texto livre, se o campo permitir)
      const choices = await this.choices(u.userId, field);
      const match = choices.find((c) => c.label.toLowerCase() === value.toLowerCase() || c.id === value);
      if (match) {
        this.apply(state, field, match.id, match.label);
      } else if (field.allowText && value) {
        this.apply(state, field, value.slice(0, 120));
      } else if (field.type === 'month' && /^\d{1,2}$/.test(value) && +value >= 1 && +value <= 12) {
        this.apply(state, field, value, choices[+value - 1]?.label);
      } else {
        return this.retry(u, state, 'Toque numa das opções.');
      }
      return this.advance(u, state);
    }

    const error = this.apply(state, field, value);
    if (error) return this.retry(u, state, error);
    return this.advance(u, state);
  }

  async onCallback(u: BotUser, state: ConversationState | null, nonce: string, action: string, arg?: string) {
    if (!state || state.flow !== 'cadastro' || state.nonce !== nonce) {
      return [{ text: 'Esse botão expirou. Use /cadastrar para começar de novo.' }];
    }
    const field = this.field(state);

    switch (action) {
      case 'cancel':
        await this.link.clearState(u.canal, u.externalUserId);
        return [{ text: 'Cadastro cancelado.' }];

      case 'save':
        return this.save(u, state);

      case 'edit': {
        const target = FORMS[state.form].fields.find((f) => f.key === arg);
        if (!target) return this.retry(u, state, 'Opção inválida.');
        state.answered = state.answered.filter((k) => k !== target.key);
        delete state.values[target.key];
        delete state.labels[target.key];
        return this.advance(u, state);
      }

      case 'skip':
        if (!field || field.required) return this.retry(u, state, 'Esse campo é obrigatório.');
        this.apply(state, field, null);
        return this.advance(u, state);

      case 'pick': {
        const id = state.options?.[Number(arg)];
        if (!field || id === undefined) return this.retry(u, state, 'Opção inválida.');
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
    return this.retry(u, state, 'Opção inválida.');
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
          if (!text) return `Digite ${field.label.toLowerCase()}.`;
          value = text.slice(0, field.maxLength ?? 120);
          break;
        case 'email':
          if (!EMAIL.test(text)) return 'E-mail inválido. Exemplo: <code>nome@email.com</code>';
          value = text.toLowerCase();
          break;
        case 'day':
        case 'month':
        case 'int': {
          const [min, max] = field.type === 'day' ? [1, 31] : field.type === 'month' ? [1, 12] : [field.min ?? 0, field.max ?? 9999];
          const n = Number(text);
          if (!Number.isInteger(n) || n < min || n > max) return `Digite um número de ${min} a ${max}.`;
          value = field.type === 'month' ? String(n) : n;
          break;
        }
        case 'money': {
          const n = F.parseAmount(text);
          if (n === null) return 'Valor inválido. Exemplo: <code>120,50</code>';
          value = n;
          break;
        }
        case 'date': {
          const d = F.parseDate(text, BillScheduleHelper.today());
          if (!d) return 'Data inválida. Use <code>dd/mm</code> ou <code>dd/mm/aaaa</code>.';
          value = d;
          break;
        }
        case 'monthYear': {
          const m = /^(\d{1,2})[/.-](\d{4})$/.exec(text);
          if (!m || +m[1] < 1 || +m[1] > 12) return 'Use <code>mm/aaaa</code>, por exemplo <code>01/2027</code>.';
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
    const hint = field.hint ?? this.defaultHint(field);
    const text = `🗂 <i>${spec.title}</i>\n<b>${field.label}</b>${field.required ? '' : ' <i>(opcional)</i>'}${hint ? `\n${hint}` : ''}`;

    const choices = await this.choices(userId, field);
    const quick = field.quick?.(BillScheduleHelper.today()) ?? [];
    const options = [...choices, ...quick].map((o) => o.id);
    const perRow = field.type === 'month' ? 3 : choices.length > 6 ? 2 : 1;

    const buttons: BotButton[][] = [
      ...F.rows(
        choices.map((c, i) => ({ label: F.label(c.label, 30), data: `f:${n}:pick:${i}` })),
        perRow,
      ),
      ...(quick.length ? [quick.map((q, i) => ({ label: q.label, data: `f:${n}:pick:${choices.length + i}` }))] : []),
      ...(field.required ? [] : [[{ label: `⏭ ${field.skipLabel ?? 'Pular'}`, data: `f:${n}:skip` }]]),
      [{ label: '❌ Cancelar', data: `f:${n}:cancel` }],
    ];
    return { reply: { text, buttons }, options };
  }

  private defaultHint(field: FieldSpec): string {
    switch (field.type) {
      case 'email':
        return 'Digite o e-mail.';
      case 'day':
        return 'Digite um dia de 1 a 31.';
      case 'month':
        return 'Toque no mês.';
      case 'date':
        return 'Digite <code>dd/mm</code> ou <code>dd/mm/aaaa</code>.';
      case 'money':
        return 'Digite o valor. Exemplo: <code>120,50</code>';
      case 'int':
        return `Digite um número de ${field.min ?? 0} a ${field.max ?? 9999}.`;
      case 'choice':
        return field.allowText ? 'Toque numa opção ou digite.' : 'Toque numa opção.';
      default:
        return '';
    }
  }

  private display(state: CadastroState, field: FieldSpec): string {
    const v = state.values[field.key];
    if (v === null || v === undefined || v === '') return field.skipLabel && !field.required ? field.skipLabel : '—';
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
      `<b>Confirma o cadastro?</b> · ${spec.title}`,
      '',
      ...fields.map((f) => `<b>${f.label}:</b> ${this.display(state, f)}`),
    ].join('\n');
    return {
      text,
      buttons: [
        [
          { label: '✅ Salvar', data: `f:${n}:save` },
          { label: '❌ Cancelar', data: `f:${n}:cancel` },
        ],
        ...F.rows(
          fields.map((f) => ({ label: f.short ?? f.label, data: `f:${n}:edit:${f.key}` })),
          3,
        ),
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
      return this.retry(u, state, `⚠️ ${F.esc(messages.join('; '))}`);
    }

    // Só quem consumir o estado grava (clique duplo / update reenviado)
    if (!(await this.link.consumeState(u.canal, u.externalUserId, state.nonce))) {
      return [{ text: 'Esse cadastro já foi processado.' }];
    }

    try {
      await this.persist(u.userId, state.form, payload);
    } catch (err) {
      if (err instanceof HttpException) {
        // Ex.: nome repetido. Volta ao resumo para corrigir, sem perder o que foi digitado
        const response = err.getResponse();
        const message = typeof response === 'string' ? response : (response as { message?: string | string[] }).message;
        return this.retry(u, state, `⚠️ ${F.esc(Array.isArray(message) ? message.join('; ') : (message ?? err.message))}`);
      }
      throw err;
    }

    const fields = this.visibleFields(spec, state.values).filter((f) => f.key !== 'nome');
    const details = fields
      .filter((f) => state.values[f.key] !== null && state.values[f.key] !== undefined && state.values[f.key] !== '')
      .map((f) => `${f.label}: ${this.display(state, f)}`);
    return [{ text: [`✅ ${spec.doneLabel}: <b>${F.esc(String(state.values.nome))}</b>`, ...details].join('\n') }];
  }

  private persist(userId: string, kind: FormKind, payload: Record<string, unknown>) {
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
