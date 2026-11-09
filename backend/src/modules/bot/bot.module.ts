import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { PreferencesModule } from '../preferences/preferences.module';
import { BillsModule } from '../bills/bills.module';
import { BotLinkService } from './bot-link.service';
import { BotEngineService } from './bot-engine.service';
import { BotLinkController } from './bot-link.controller';
import { ExpenseFlow } from './flows/expense.flow';
import { BillsFlow } from './flows/bills.flow';
import { SummaryFlow } from './flows/summary.flow';
import { TelegramAdapter } from './telegram/telegram.adapter';
import { TelegramController } from './telegram/telegram.controller';

@Module({
  imports: [PrismaModule, ExpensesModule, PreferencesModule, BillsModule],
  controllers: [BotLinkController, TelegramController],
  providers: [BotLinkService, BotEngineService, ExpenseFlow, BillsFlow, SummaryFlow, TelegramAdapter],
})
export class BotModule {}
