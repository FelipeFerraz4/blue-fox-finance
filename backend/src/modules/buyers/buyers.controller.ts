import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const isActiveOnly = activeOnly === 'true';
    return this.buyersService.findAll(userId, isActiveOnly ? true : undefined);
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.buyersService.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateBuyerDto,
  ) {
    return this.buyersService.create(userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBuyerDto,
  ) {
    return this.buyersService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.buyersService.remove(userId, id);
  }
}

