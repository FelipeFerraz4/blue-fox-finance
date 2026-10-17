import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('categoria') categoria?: string,
  ) {
    return this.storesService.findAll(userId, categoria);
  }

  @Get('categories')
  getCategories(@CurrentUser('sub') userId: string) {
    return this.storesService.getCategories(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.storesService.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateStoreDto,
  ) {
    return this.storesService.create(userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.storesService.remove(userId, id);
  }
}

