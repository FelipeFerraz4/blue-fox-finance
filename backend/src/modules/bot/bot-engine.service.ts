import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotLinkService } from './bot-link.service';
import { BotFormat as F } from './bot-format';
import { BotIncoming, BotReply, BotUser } from './bot.types';
import { ExpenseFlow } from './flows/expense.flow';
import { BillsFlow } from './flows/bills.flow';
import { SummaryFlow } from './flows/summary.flow';

const RATE_LIMIT = 60; // mensagens por minuto por usuário (o assistente usa ~12 por lançamento)
const RATE_WINDOW_MS = 60_000;

export const BOT_COMMANDS = [
  // O Telegram só aceita a-z, 0-9 e _ em comandos: "/lançamento" digitado também é aceito
  { command: 'lancamento', description: 'Novo lançamento' },
  { command: 'resumo', description: 'Gastos do mês' },
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
    private readonly config: ConfigService,
  ) {}

  async handle(msg: BotIncoming): Promise<BotReply[]> {
    if (!msg.isPrivate) {
      return [{ text: 'Por segurança, só converso em chat privado.' }];
    }
    if (this.rateLimited(`${msg.canal}:${msg.externalUserId}`)) {
      return [{ text: 'Muitas mensagens seguidas. Espere um minuto, por favor.' }];
    }

    try {
      return await this.route(msg);
    } catch (err) {
      if (err instanceof HttpException) {
        // Erros de negócio dos services (ex.: "Meio de pagamento não existe")
        const response = err.getResponse();
        const message = typeof response === 'string' ? response : (response as { message?: string | string[] }).message;
        return [{ text: `⚠️ ${F.esc(Array.isArray(message) ? message.join('; ') : (message ?? err.message))}` }];
      }
      this.logger.error(`Erro ao processar mensagem do bot: ${(err as Error).message}`, (err as Error).stack);
      return [{ text: '⚠️ Algo deu errado. Tente de novo em instantes.' }];
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

    if (msg.callbackData) return this.onCallback(u, msg.callbackData);

    if (command) {
      switch (command) {
        case 'lancamento':
        case 'lançamento':
        case 'novo':
        case 'gasto': // nome antigo, mantido para quem já se acostumou
          return this.expense.start(u, args);
        case 'resumo':
          return this.summaryFlow.summary(u);
        case 'contas':
          return this.billsFlow.list(u);
        case 'ultimos':
        case 'últimos':
          return this.expense.recent(u);
        case 'cancelar':
          await this.link.clearState(u.canal, u.externalUserId);
          return [{ text: 'Ok, cancelado.' }];
        case 'desconectar':
          await this.link.unlinkUser(userId);
          return [{ text: 'Conta desvinculada. Para conectar de novo, use o botão no seu perfil do site.' }];
        case 'start':
        case 'ajuda':
        case 'help':
        case 'menu':
          return [this.menu()];
        default:
          return [{ text: 'Não conheço esse comando.' }, this.menu()];
      }
    }

    // Texto livre: continua a conversa em andamento, inicia um lançamento se começar
    // por um valor, ou mostra o menu (ex.: "oi" no início da conversa)
    const state = await this.link.getState(u.canal, u.externalUserId);
    if (state?.flow === 'gasto') return this.expense.onText(u, state, text);
    if (state?.flow === 'conta-valor') return this.billsFlow.onText(u, state, text);
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
        }
    }
    return [{ text: 'Esse botão não é mais válido.' }];
  }

  private async linkAccount(msg: BotIncoming, code: string): Promise<BotReply[]> {
    const result = await this.link.consumeLinkCode(code, msg.canal, msg.externalUserId, msg.chatId, msg.username);
    if (!result.ok) {
      return [{ text: '❌ Código inválido ou expirado. Gere um novo no seu perfil do site (vale por 10 minutos).' }];
    }
    this.logger.log(`Conta vinculada ao ${msg.canal}`);
    return [{ text: '✅ <b>Conta conectada!</b> Agora o que você lançar aqui aparece no site.' }, this.menu()];
  }

  /** Menu inicial: o que cada comando faz, com atalhos em botões. */
  private menu(): BotReply {
    return {
      text: [
        '<b>Blue Fox Finance</b> 🦊',
        '',
        '<b>Novo lançamento</b>',
        '/lancamento · responda às perguntas (os mesmos campos do site)',
        'ou já comece com valor, item e loja: <code>45,90 pão @ padaria</code>',
        '',
        '<b>Consultar</b>',
        '/resumo · gastos do mês',
        '/contas · contas a pagar e confirmação de pagamento',
        '/ultimos · últimos lançamentos',
        '',
        '<b>Outros</b>',
        '/cancelar · cancela o que estiver em andamento',
        '/desconectar · desvincula sua conta',
      ].join('\n'),
      buttons: [
        [{ label: '➕ Novo lançamento', data: 'm::lancamento' }],
        [
          { label: '📊 Resumo', data: 'm::resumo' },
          { label: '🔔 Contas', data: 'm::contas' },
          { label: '🧾 Últimos', data: 'm::ultimos' },
        ],
      ],
    };
  }

  private notLinked(): BotReply {
    const site = this.config.get<string>('FRONTEND_URL', '');
    const where = site ? ` em <b>${F.esc(site.replace(/\/$/, ''))}/admin/user-profile</b>` : ' no seu perfil do site';
    return {
      text: `Olá! Para usar o bot, conecte sua conta Blue Fox Finance: abra o seu perfil${where} e toque em <b>Conectar Telegram</b>.`,
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
