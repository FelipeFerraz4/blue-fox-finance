import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, PreviewInstallmentsDto, UpdateExpenseDto } from './dto/expense.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(userId, dto);
  }

  @Post('preview-installments')
  previewInstallments(
    @CurrentUser('sub') userId: string,
    @Body() dto: PreviewInstallmentsDto,
  ) {
    return this.expensesService.previewInstallments(userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('mesReferencia') mesReferencia?: string,
    @Query('loja') loja?: string,
    @Query('lojaId') lojaId?: string,
    @Query('categoriaLoja') categoriaLoja?: string,
    @Query('meioPagamentoId') meioPagamentoId?: string,
    @Query('categoria') categoria?: string,
    @Query('comprador') comprador?: string,
    @Query('compradorId') compradorId?: string,
    @Query('search') search?: string,
  ) {
    return this.expensesService.findAll(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      mesReferencia,
      loja,
      lojaId,
      categoriaLoja,
      meioPagamentoId,
      categoria,
      comprador,
      compradorId,
      search,
    });
  }

  @Get('grouped')
  findGroupedByDayAndStore(
    @CurrentUser('sub') userId: string,
    @Query('month') month?: string,
  ) {
    return this.expensesService.findGroupedByDayAndStore(userId, month);
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.findOne(userId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.remove(userId, id);
  }
}

