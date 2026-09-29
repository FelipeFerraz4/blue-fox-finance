import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';

@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    const isActiveOnly = activeOnly === 'true';
    return this.buyersService.findAll(isActiveOnly ? true : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buyersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBuyerDto) {
    return this.buyersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBuyerDto) {
    return this.buyersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buyersService.remove(id);
  }
}
