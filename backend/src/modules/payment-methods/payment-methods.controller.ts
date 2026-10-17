import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    return this.paymentMethodsService.findAll(userId, onlyActive === 'true');
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.paymentMethodsService.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.create(userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    return this.paymentMethodsService.remove(userId, id, force === 'true');
  }
}

