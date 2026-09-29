import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StoresModule } from './modules/stores/stores.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    PrismaModule,
    PaymentMethodsModule,
    ExpensesModule,
    DashboardModule,
    StoresModule,
    BuyersModule,
    CategoriesModule,
  ],
})
export class AppModule {}
