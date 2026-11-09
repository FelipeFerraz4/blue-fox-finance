import { Controller, Delete, Get, HttpCode, Post, ServiceUnavailableException } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';
import { CurrentUser } from '../auth/current-user.decorator';
import { BotLinkService } from './bot-link.service';
import { TelegramAdapter } from './telegram/telegram.adapter';

/** Vínculo da conta com o bot, usado pela tela de perfil do site. */
@Controller('bot/link')
@Roles(...FINANCE_ACCESS_ROLES)
export class BotLinkController {
  constructor(
    private readonly link: BotLinkService,
    private readonly telegram: TelegramAdapter,
  ) {}

  @Get()
  async status(@CurrentUser('sub') userId: string) {
    const vinculo = await this.link.getLink(userId);
    return {
      enabled: this.telegram.enabled,
      botUsername: this.telegram.username,
      vinculo,
    };
  }

  /** Gera o código de uso único e o deep link t.me/<bot>?start=<código>. */
  @Post('code')
  async createCode(@CurrentUser('sub') userId: string) {
    if (!this.telegram.enabled) {
      throw new ServiceUnavailableException('Telegram bot is not configured.');
    }
    const { code, expiraEm } = await this.link.createLinkCode(userId);
    return {
      url: `https://t.me/${this.telegram.username}?start=${code}`,
      expiraEm,
    };
  }

  @Delete()
  @HttpCode(204)
  async unlink(@CurrentUser('sub') userId: string) {
    await this.link.unlinkUser(userId);
  }
}
