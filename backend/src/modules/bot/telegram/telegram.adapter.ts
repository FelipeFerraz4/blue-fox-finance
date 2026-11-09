import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CanalBot } from '@prisma/client';
import { Bot, Context } from 'grammy';
import type { InlineKeyboardMarkup, Update } from 'grammy/types';
import { timingSafeEqual } from 'crypto';
import { BOT_COMMANDS, BotEngineService } from '../bot-engine.service';
import { BotButton, BotIncoming, BotReply } from '../bot.types';

/**
 * Adaptador do Telegram (grammY). Traduz updates para BotIncoming e as
 * respostas do BotEngine para mensagens com teclado inline.
 * - TELEGRAM_MODE=webhook (produção): registra o webhook com secret_token.
 * - TELEGRAM_MODE=polling (desenvolvimento): long polling, sem URL pública.
 * Sem TELEGRAM_BOT_TOKEN o bot fica desligado e nada é chamado.
 */
@Injectable()
export class TelegramAdapter implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(TelegramAdapter.name);
  private bot?: Bot;
  private ready = false;
  private polling = false;

  constructor(
    private readonly config: ConfigService,
    private readonly engine: BotEngineService,
  ) {}

  get enabled(): boolean {
    return this.ready;
  }

  get username(): string | null {
    return this.ready ? this.bot!.botInfo.username : null;
  }

  onApplicationBootstrap() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.log('TELEGRAM_BOT_TOKEN não definido: bot do Telegram desligado.');
      return;
    }
    // Em segundo plano: Telegram lento ou fora do ar não atrasa a subida da API
    void this.start(token);
  }

  private async start(token: string) {
    const bot = new Bot(token);
    bot.on('message:text', (ctx) => this.dispatch(ctx, { text: ctx.message.text }));
    bot.on('callback_query:data', (ctx) => this.dispatch(ctx, { callbackData: ctx.callbackQuery.data }));
    bot.catch((err) => this.logger.error(`Erro no update do Telegram: ${err.message}`));
    this.bot = bot;

    try {
      await bot.init();
      await bot.api.setMyCommands(BOT_COMMANDS);
      const mode = this.config.get<string>('TELEGRAM_MODE', 'webhook');
      if (mode === 'polling') {
        this.polling = true;
        // start() remove o webhook e só resolve quando o bot para
        void bot
          .start({ allowed_updates: ['message', 'callback_query'] })
          .catch((err) => this.logger.error(`Polling do Telegram parou: ${err.message}`));
      } else {
        await this.registerWebhook(bot);
      }
      this.ready = true;
      this.logger.log(`Bot do Telegram @${bot.botInfo.username} ativo (${mode}).`);
    } catch (err) {
      // Token inválido ou sem rede: a API continua no ar, só o bot fica desligado
      this.logger.error(`Não foi possível iniciar o bot do Telegram: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    if (this.polling) await this.bot?.stop();
  }

  /** Confere o header X-Telegram-Bot-Api-Secret-Token em tempo constante. */
  isValidSecret(received: string | undefined): boolean {
    const expected = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET', '');
    if (!expected || !received) return false;
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  async handleWebhook(update: Update) {
    await this.bot!.handleUpdate(update);
  }

  private async registerWebhook(bot: Bot) {
    const base = this.config.get<string>('PUBLIC_API_URL', '');
    const secret = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET', '');
    if (!base.startsWith('https://') || !secret) {
      throw new Error('modo webhook exige PUBLIC_API_URL (https) e TELEGRAM_WEBHOOK_SECRET');
    }
    await bot.api.setWebhook(`${base.replace(/\/$/, '')}/api/bot/telegram`, {
      secret_token: secret,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  private async dispatch(ctx: Context, payload: Pick<BotIncoming, 'text' | 'callbackData'>) {
    if (!ctx.from || !ctx.chat) return;
    const incoming: BotIncoming = {
      canal: CanalBot.TELEGRAM,
      externalUserId: String(ctx.from.id),
      chatId: String(ctx.chat.id),
      username: ctx.from.username,
      isPrivate: ctx.chat.type === 'private',
      ...payload,
    };

    if (payload.callbackData) {
      await ctx.answerCallbackQuery().catch(() => undefined);
      // Tira os botões da mensagem clicada para não serem usados de novo
      await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } }).catch(() => undefined);
    }

    const replies = await this.engine.handle(incoming);
    for (const reply of replies) {
      await ctx.reply(reply.text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: this.keyboard(reply),
      });
    }
  }

  private keyboard(reply: BotReply): InlineKeyboardMarkup | undefined {
    if (!reply.buttons?.length) return undefined;
    const toButton = (b: BotButton) =>
      b.url ? { text: b.label, url: b.url } : { text: b.label, callback_data: b.data ?? 'noop' };
    return { inline_keyboard: reply.buttons.filter((row) => row.length).map((row) => row.map(toButton)) };
  }
}
