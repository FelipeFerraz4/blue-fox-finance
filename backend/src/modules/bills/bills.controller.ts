import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto, PayBillOccurrenceDto, UpdateBillDto } from './dto/bill.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.billsService.findAll(userId);
  }

  // Rotas fixas antes de ':id' para não serem capturadas como ID
  @Get('occurrences')
  getOccurrences(
    @CurrentUser('sub') userId: string,
    @Query('month') month?: string,
  ) {
    return this.billsService.getOccurrences(userId, month);
  }

  @Get('alerts')
  getAlerts(@CurrentUser('sub') userId: string) {
    return this.billsService.getAlerts(userId);
  }

  @Patch('occurrences/:id/pay')
  pay(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: PayBillOccurrenceDto,
  ) {
    return this.billsService.pay(userId, id, dto);
  }

  @Patch('occurrences/:id/unpay')
  unpay(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.billsService.unpay(userId, id);
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.billsService.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateBillDto,
  ) {
    return this.billsService.create(userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBillDto,
  ) {
    return this.billsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.billsService.remove(userId, id);
  }
}
