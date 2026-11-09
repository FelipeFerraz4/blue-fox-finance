import { Body, Controller, Headers, HttpCode, Logger, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import type { Update } from 'grammy/types';
import { Public } from '../../auth/public.decorator';
import { TelegramAdapter } from './telegram.adapter';

/**
 * Webhook do Telegram. Público (o Telegram não manda JWT), protegido pelo
 * secret_token registrado no setWebhook.
 */
@Controller('bot/telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegram: TelegramAdapter) {}

  @Public()
  @Post()
  @HttpCode(200)
  async webhook(
    @Headers('x-telegram-bot-api-secret-token') secret: string | undefined,
    @Body() update: Record<string, unknown>,
  ) {
    if (!this.telegram.enabled) throw new NotFoundException();
    if (!this.telegram.isValidSecret(secret)) throw new UnauthorizedException();

    try {
      await this.telegram.handleWebhook(update as unknown as Update);
    } catch (err) {
      // Responde 200 mesmo assim: erro aqui faria o Telegram reenviar o mesmo update sem parar
      this.logger.error(`Falha ao processar update do Telegram: ${(err as Error).message}`);
    }
    return { ok: true };
  }
}
