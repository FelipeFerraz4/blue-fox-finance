import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateItemCategoryDto,
  UpdateItemCategoryDto,
  CreateStoreCategoryDto,
  UpdateStoreCategoryDto,
} from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== CATEGORIAS DE ITENS =====================

  async findAllItemCategories(activeOnly?: boolean) {
    return this.prisma.categoriaItem.findMany({
      where: activeOnly ? { ativo: true } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async findItemCategoryById(id: string) {
    const cat = await this.prisma.categoriaItem.findUnique({
      where: { id },
    });
    if (!cat) {
      throw new NotFoundException(`Categoria de item com ID ${id} não encontrada.`);
    }
    return cat;
  }

  async createItemCategory(dto: CreateItemCategoryDto) {
    const existing = await this.prisma.categoriaItem.findFirst({
      where: { nome: { equals: dto.nome.trim(), mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Uma categoria de item com o nome "${dto.nome}" já está cadastrada.`);
    }

    return this.prisma.categoriaItem.create({
      data: {
        nome: dto.nome.trim(),
        cor: dto.cor?.trim() || null,
        icone: dto.icone?.trim() || null,
        ativo: dto.ativo !== undefined ? dto.ativo : true,
      },
    });
  }

  async updateItemCategory(id: string, dto: UpdateItemCategoryDto) {
    await this.findItemCategoryById(id);

    if (dto.nome) {
      const existing = await this.prisma.categoriaItem.findFirst({
        where: {
          nome: { equals: dto.nome.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Outra categoria de item com o nome "${dto.nome}" já está cadastrada.`);
      }
    }

    return this.prisma.categoriaItem.update({
      where: { id },
      data: {
        nome: dto.nome ? dto.nome.trim() : undefined,
        cor: dto.cor !== undefined ? (dto.cor?.trim() || null) : undefined,
        icone: dto.icone !== undefined ? (dto.icone?.trim() || null) : undefined,
        ativo: dto.ativo !== undefined ? dto.ativo : undefined,
      },
    });
  }

  async removeItemCategory(id: string) {
    await this.findItemCategoryById(id);
    return this.prisma.categoriaItem.delete({
      where: { id },
    });
  }

  // ===================== CATEGORIAS DE LOJAS =====================

  async findAllStoreCategories(activeOnly?: boolean) {
    return this.prisma.categoriaLoja.findMany({
      where: activeOnly ? { ativo: true } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async findStoreCategoryById(id: string) {
    const cat = await this.prisma.categoriaLoja.findUnique({
      where: { id },
    });
    if (!cat) {
      throw new NotFoundException(`Categoria de loja com ID ${id} não encontrada.`);
    }
    return cat;
  }

  async createStoreCategory(dto: CreateStoreCategoryDto) {
    const existing = await this.prisma.categoriaLoja.findFirst({
      where: { nome: { equals: dto.nome.trim(), mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Uma categoria de loja com o nome "${dto.nome}" já está cadastrada.`);
    }

    return this.prisma.categoriaLoja.create({
      data: {
        nome: dto.nome.trim(),
        descricao: dto.descricao?.trim() || null,
        ativo: dto.ativo !== undefined ? dto.ativo : true,
      },
    });
  }

  async updateStoreCategory(id: string, dto: UpdateStoreCategoryDto) {
    await this.findStoreCategoryById(id);

    if (dto.nome) {
      const existing = await this.prisma.categoriaLoja.findFirst({
        where: {
          nome: { equals: dto.nome.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Outra categoria de loja com o nome "${dto.nome}" já está cadastrada.`);
      }
    }

    return this.prisma.categoriaLoja.update({
      where: { id },
      data: {
        nome: dto.nome ? dto.nome.trim() : undefined,
        descricao: dto.descricao !== undefined ? (dto.descricao?.trim() || null) : undefined,
        ativo: dto.ativo !== undefined ? dto.ativo : undefined,
      },
    });
  }

  async removeStoreCategory(id: string) {
    await this.findStoreCategoryById(id);
    return this.prisma.categoriaLoja.delete({
      where: { id },
    });
  }
}
