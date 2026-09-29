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

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ===================== CATEGORIAS DE ITENS =====================

  @Get('items')
  findAllItems(@Query('activeOnly') activeOnly?: string) {
    return this.categoriesService.findAllItemCategories(activeOnly === 'true');
  }

  @Get('items/:id')
  findItemById(@Param('id') id: string) {
    return this.categoriesService.findItemCategoryById(id);
  }

  @Post('items')
  createItem(@Body() dto: CreateItemCategoryDto) {
    return this.categoriesService.createItemCategory(dto);
  }

  @Put('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateItemCategoryDto) {
    return this.categoriesService.updateItemCategory(id, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.categoriesService.removeItemCategory(id);
  }

  // ===================== CATEGORIAS DE LOJAS =====================

  @Get('stores')
  findAllStores(@Query('activeOnly') activeOnly?: string) {
    return this.categoriesService.findAllStoreCategories(activeOnly === 'true');
  }

  @Get('stores/:id')
  findStoreById(@Param('id') id: string) {
    return this.categoriesService.findStoreCategoryById(id);
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreCategoryDto) {
    return this.categoriesService.createStoreCategory(dto);
  }

  @Put('stores/:id')
  updateStore(@Param('id') id: string, @Body() dto: UpdateStoreCategoryDto) {
    return this.categoriesService.updateStoreCategory(id, dto);
  }

  @Delete('stores/:id')
  removeStore(@Param('id') id: string) {
    return this.categoriesService.removeStoreCategory(id);
  }
}
