import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { RolesGuard } from './modules/auth/roles.guard';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { StoresModule } from './modules/stores/stores.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { BillsModule } from './modules/bills/bills.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BotModule } from './modules/bot/bot.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PaymentMethodsModule,
    ExpensesModule,
    StoresModule,
    BuyersModule,
    CategoriesModule,
    PreferencesModule,
    BillsModule,
    AnalyticsModule,
    BotModule,
    UsersModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
