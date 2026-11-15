import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotLinkService } from './bot-link.service';
import { BotFormat as F } from './bot-format';
import { BotIncoming, BotReply, BotUser } from './bot.types';
import { ExpenseFlow } from './flows/expense.flow';
import { BillsFlow } from './flows/bills.flow';
import { SummaryFlow } from './flows/summary.flow';
import { RegisterFlow } from './flows/register.flow';
import { FormKind } from './bot.types';
import { PreferencesService } from '../preferences/preferences.service';
import { LocaleContext, runWithLocale } from '../../common/i18n/locale-context';
import { Language } from '../../common/constants/locale';
import { t, translateMessage } from '../../common/i18n/translate';

/** Atalhos diretos para cada cadastro (ex.: "/novaloja Padaria Sol"). */
const REGISTER_COMMANDS: Record<string, FormKind> = {
  novaloja: 'loja',
  novocomprador: 'comprador',
  novomeio: 'meio',
  novacategoria: 'categoria-item',
  novacategorialoja: 'categoria-loja',
  novaconta: 'conta',
};

const RATE_LIMIT = 60; // mensagens por minuto por usuário (o assistente usa ~12 por lançamento)
const RATE_WINDOW_MS = 60_000;

export const BOT_COMMANDS = [
  // O Telegram só aceita a-z, 0-9 e _ em comandos: "/lançamento" digitado também é aceito
  { command: 'lancamento', description: 'Novo lançamento' },
  { command: 'cadastrar', description: 'Cadastrar loja, comprador, meio, categoria ou conta' },
  { command: 'resumo', description: 'Gastos do mês e futuros' },
  { command: 'contas', description: 'Contas a pagar' },
  { command: 'ultimos', description: 'Últimos lançamentos' },
  { command: 'cancelar', description: 'Cancelar o que estiver em andamento' },
  { command: 'ajuda', description: 'Como usar' },
  { command: 'desconectar', description: 'Desvincular sua conta' },
];

/**
 * Núcleo do bot, independente de canal: recebe uma mensagem normalizada,
 * resolve o usuário pelo vínculo e devolve as respostas. O adaptador (Telegram,
 * futuramente WhatsApp) só traduz de/para o formato do canal.
 */
@Injectable()
export class BotEngineService {
  private readonly logger = new Logger(BotEngineService.name);
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly link: BotLinkService,
    private readonly expense: ExpenseFlow,
    private readonly billsFlow: BillsFlow,
    private readonly summaryFlow: SummaryFlow,
    private readonly register: RegisterFlow,
    private readonly config: ConfigService,
    private readonly preferences: PreferencesService,
  ) {}

  /** Atende no idioma e país do usuário: textos (t) e formatos (BotFormat) leem o contexto. */
  async handle(msg: BotIncoming): Promise<BotReply[]> {
    const locale = await this.resolveLocale(msg);
    return runWithLocale(locale, () => this.handleInLocale(msg));
  }

  /** Escolha salva no site; sem ela, o idioma do app do Telegram (português → pt, outro → en). */
  private async resolveLocale(msg: BotIncoming): Promise<LocaleContext> {
    const userId = msg.isPrivate ? await this.link.findUserId(msg.canal, msg.externalUserId) : null;
    if (userId) {
      const pref = await this.preferences.getLocale(userId);
      if (pref.salvo) return { lang: pref.idioma, region: pref.regiao };
    }
    const code = msg.languageCode?.toLowerCase();
    const lang: Language = !code || code.startsWith('pt') ? 'pt' : 'en';
    return { lang, region: lang === 'pt' ? 'BR' : 'US' };
  }

  private async handleInLocale(msg: BotIncoming): Promise<BotReply[]> {
    if (!msg.isPrivate) {
      return [{ text: t('Por segurança, só converso em chat privado.') }];
    }
    if (this.rateLimited(`${msg.canal}:${msg.externalUserId}`)) {
      return [{ text: t('Muitas mensagens seguidas. Espere um minuto, por favor.') }];
    }

    try {
      return await this.route(msg);
    } catch (err) {
      if (err instanceof HttpException) {
        // Erros de negócio dos services (ex.: "Meio de pagamento não existe")
        const response = err.getResponse();
        const message = typeof response === 'string' ? response : (response as { message?: string | string[] }).message;
        const list = Array.isArray(message) ? message : [message ?? err.message];
        return [{ text: `⚠️ ${F.esc(list.map((m) => translateMessage(String(m))).join('; '))}` }];
      }
      this.logger.error(`Erro ao processar mensagem do bot: ${(err as Error).message}`, (err as Error).stack);
      return [{ text: t('⚠️ Algo deu errado. Tente de novo em instantes.') }];
    }
  }

  private async route(msg: BotIncoming): Promise<BotReply[]> {
    const text = msg.text?.trim() ?? '';
    const [rawCommand, ...rest] = text.split(/\s+/);
    // "/lancamento@MeuBot" → "lancamento"
    const command = rawCommand?.startsWith('/') ? rawCommand.slice(1).split('@')[0].toLowerCase() : null;
    const args = rest.join(' ');

    if (command === 'start' && args) {
      return this.linkAccount(msg, args);
    }

    const userId = await this.link.findUserId(msg.canal, msg.externalUserId);
    if (!userId) return [this.notLinked()];
    const u: BotUser = { userId, canal: msg.canal, externalUserId: msg.externalUserId };

    const replies = msg.callbackData ? await this.onCallback(u, msg.callbackData) : await this.onMessage(u, text, command, args);
    return this.withFollowUp(u, replies);
  }

  /**
   * Terminada uma operação (nenhuma conversa em andamento), acrescenta à última resposta
   * um convite curto para continuar, com Sim (menu compacto) e Não (despedida).
   */
  private async withFollowUp(u: BotUser, replies: BotReply[]): Promise<BotReply[]> {
    const last = replies[replies.length - 1];
    if (!last || last.noFollowUp) return replies;
    if (await this.link.getState(u.canal, u.externalUserId)) return replies;
    return [
      ...replies.slice(0, -1),
      {
        ...last,
        text: `${last.text}\n\n${t('<i>Mais alguma coisa?</i>')}`,
        buttons: [
          ...(last.buttons ?? []),
          [
            { label: t('👍 Sim'), data: 'm::mais' },
            { label: t('👋 Não'), data: 'm::tchau' },
          ],
        ],
      },
    ];
  }

  private async onMessage(u: BotUser, text: string, command: string | null, args: string): Promise<BotReply[]> {
    if (command) {
      switch (command) {
        case 'lancamento':
        case 'lançamento':
        case 'novo':
        case 'gasto': // nome antigo, mantido para quem já se acostumou
          return this.expense.start(u, args);
        case 'cadastrar':
        case 'cadastro':
          return this.register.menu();
        case 'resumo':
          return this.summaryFlow.summary(u);
        case 'contas':
          return this.billsFlow.list(u);
        case 'ultimos':
        case 'últimos':
          return this.expense.recent(u);
        case 'cancelar':
          await this.link.clearState(u.canal, u.externalUserId);
          return [{ text: t('Ok, cancelado.') }];
        case 'desconectar':
          await this.link.unlinkUser(u.userId);
          return [{ text: t('Conta desvinculada. Para conectar de novo, use o botão no seu perfil do site.'), noFollowUp: true }];
        case 'start':
        case 'ajuda':
        case 'help':
        case 'menu':
          return [this.menu()];
        default:
          if (REGISTER_COMMANDS[command]) return this.register.start(u, REGISTER_COMMANDS[command], args);
          return [{ text: t('Não conheço esse comando.') }, this.menu()];
      }
    }

    // Texto livre: continua a conversa em andamento, inicia um lançamento se começar
    // por um valor, ou mostra o menu (ex.: "oi" no início da conversa)
    const state = await this.link.getState(u.canal, u.externalUserId);
    if (state?.flow === 'gasto') return this.expense.onText(u, state, text);
    if (state?.flow === 'conta-valor' || state?.flow === 'conta-previsto') return this.billsFlow.onText(u, state, text);
    if (state?.flow === 'cadastro') return this.register.onText(u, state, text);
    if (F.parseAmount(text.split(/\s+/)[0] ?? '')) return this.expense.start(u, text);
    return [this.menu()];
  }

  private async onCallback(u: BotUser, data: string): Promise<BotReply[]> {
    const [prefix, nonce, action, arg] = data.split(':');
    switch (prefix) {
      case 'g': {
        const state = await this.link.getState(u.canal, u.externalUserId);
        return this.expense.onCallback(u, state, nonce, action, arg);
      }
      case 'x':
        return this.expense.onStatelessCallback(u, action, arg);
      case 'c':
        return this.billsFlow.onCallback(u, action, arg);
      case 'f': {
        const state = await this.link.getState(u.canal, u.externalUserId);
        return this.register.onCallback(u, state, nonce, action, arg);
      }
      case 'r':
        if (Object.values(REGISTER_COMMANDS).includes(action as FormKind)) {
          return this.register.start(u, action as FormKind);
        }
        break;
      case 'm':
        // Botões do menu inicial
        switch (action) {
          case 'lancamento':
            return this.expense.start(u, '');
          case 'resumo':
            return this.summaryFlow.summary(u);
          case 'contas':
            return this.billsFlow.list(u);
          case 'ultimos':
            return this.expense.recent(u);
          case 'cadastrar':
            return this.register.menu();
          case 'mais':
            return [this.quickMenu()];
          case 'tchau':
            return [{ text: t('Até mais! 👋 Quando precisar, é só mandar uma mensagem.'), noFollowUp: true }];
        }
    }
    return [{ text: t('Esse botão não é mais válido.') }];
  }

  private async linkAccount(msg: BotIncoming, code: string): Promise<BotReply[]> {
    const result = await this.link.consumeLinkCode(code, msg.canal, msg.externalUserId, msg.chatId, msg.username);
    if (!result.ok) {
      return [{ text: t('❌ Código inválido ou expirado. Gere um novo no seu perfil do site (vale por 10 minutos).') }];
    }
    this.logger.log(`Conta vinculada ao ${msg.canal}`);
    // Recém-vinculado: agora vale o idioma escolhido no site
    const locale = await this.resolveLocale(msg);
    return runWithLocale(locale, () => [{ text: t('✅ <b>Conta conectada!</b> Agora o que você lançar aqui aparece no site.') }, this.menu()]);
  }

  /** Menu inicial: o que cada comando faz, com atalhos em botões. */
  private menu(): BotReply {
    return {
      text: [
        t('<b>Blue Fox Finance</b> 🦊'),
        '',
        t('<b>Novo lançamento</b>'),
        t('/lancamento · responda às perguntas (os mesmos campos do site)'),
        t('ou já comece com valor, item e loja: <code>45,90 pão @ padaria</code>'),
        '',
        t('<b>Consultar</b>'),
        t('/resumo · gastos do mês e dos próximos meses'),
        t('/contas · contas a pagar e confirmação de pagamento'),
        t('/ultimos · últimos lançamentos'),
        '',
        t('<b>Cadastros</b>'),
        t('/cadastrar · loja, comprador, meio de pagamento, categoria ou conta a pagar'),
        '',
        t('<b>Outros</b>'),
        t('/cancelar · cancela o que estiver em andamento'),
        t('/desconectar · desvincula sua conta'),
      ].join('\n'),
      buttons: this.menuButtons(),
      noFollowUp: true,
    };
  }

  /** Só os botões do menu, para quem respondeu "Sim" ao "Mais alguma coisa?". */
  private quickMenu(): BotReply {
    return { text: t('O que vamos fazer?'), buttons: this.menuButtons(), noFollowUp: true };
  }

  private menuButtons(): BotReply['buttons'] {
    return [
      [{ label: t('➕ Novo lançamento'), data: 'm::lancamento' }],
      [
        { label: t('📊 Resumo'), data: 'm::resumo' },
        { label: t('🔔 Contas'), data: 'm::contas' },
        { label: t('🧾 Últimos'), data: 'm::ultimos' },
      ],
      [{ label: t('🗂 Cadastrar'), data: 'm::cadastrar' }],
    ];
  }

  private notLinked(): BotReply {
    const site = this.config.get<string>('FRONTEND_URL', '');
    const where = site ? t(' em <b>{url}</b>', { url: `${F.esc(site.replace(/\/$/, ''))}/admin/user-profile` }) : t(' no seu perfil do site');
    return {
      text: t('Olá! Para usar o bot, conecte sua conta Blue Fox Finance: abra o seu perfil{onde} e toque em <b>Conectar Telegram</b>.', { onde: where }),
      noFollowUp: true,
    };
  }

  private rateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    recent.push(now);
    this.hits.set(key, recent);
    if (this.hits.size > 10_000) {
      // Evita crescer sem limite: remove chaves sem atividade recente
      for (const [k, times] of this.hits) if (!times.some((t) => now - t < RATE_WINDOW_MS)) this.hits.delete(k);
    }
    return recent.length > RATE_LIMIT;
  }
}
