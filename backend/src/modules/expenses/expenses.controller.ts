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

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Post('preview-installments')
  previewInstallments(@Body() dto: PreviewInstallmentsDto) {
    return this.expensesService.previewInstallments(dto);
  }

  @Get()
  findAll(
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
    return this.expensesService.findAll({
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
  findGroupedByDayAndStore(@Query('month') month?: string) {
    return this.expensesService.findGroupedByDayAndStore(month);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
