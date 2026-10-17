import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  CreateItemCategoryDto,
  UpdateItemCategoryDto,
  CreateStoreCategoryDto,
  UpdateStoreCategoryDto,
} from './dto/category.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ===================== CATEGORIAS DE ITENS =====================

  @Get('items')
  findAllItems(
    @CurrentUser('sub') userId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.categoriesService.findAllItemCategories(userId, activeOnly === 'true');
  }

  @Get('items/:id')
  findItemById(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.findItemCategoryById(userId, id);
  }

  @Post('items')
  createItem(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateItemCategoryDto,
  ) {
    return this.categoriesService.createItemCategory(userId, dto);
  }

  @Put('items/:id')
  updateItem(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateItemCategoryDto,
  ) {
    return this.categoriesService.updateItemCategory(userId, id, dto);
  }

  @Delete('items/:id')
  removeItem(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.removeItemCategory(userId, id);
  }

  // ===================== CATEGORIAS DE LOJAS =====================

  @Get('stores')
  findAllStores(
    @CurrentUser('sub') userId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.categoriesService.findAllStoreCategories(userId, activeOnly === 'true');
  }

  @Get('stores/:id')
  findStoreById(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.findStoreCategoryById(userId, id);
  }

  @Post('stores')
  createStore(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateStoreCategoryDto,
  ) {
    return this.categoriesService.createStoreCategory(userId, dto);
  }

  @Put('stores/:id')
  updateStore(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStoreCategoryDto,
  ) {
    return this.categoriesService.updateStoreCategory(userId, id, dto);
  }

  @Delete('stores/:id')
  removeStore(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.removeStoreCategory(userId, id);
  }
}

