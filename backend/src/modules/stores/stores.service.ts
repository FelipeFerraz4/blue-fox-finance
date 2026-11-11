import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, category?: string) {
    return this.prisma.loja.findMany({
      where: {
        userId,
        ...(category ? { categoria: { equals: category, mode: 'insensitive' } } : {}),
      },
      orderBy: { nome: 'asc' },
    });
  }

  async getCategories(userId: string): Promise<string[]> {
    const stores = await this.prisma.loja.findMany({
      select: { categoria: true },
      distinct: ['categoria'],
      where: {
        userId,
        categoria: { not: null },
      },
    });

    return stores
      .map((s) => s.categoria)
      .filter((c): c is string => Boolean(c && c.trim() !== ''))
      .sort();
  }

  async findOne(userId: string, id: string) {
    const store = await this.prisma.loja.findFirst({
      where: { id, userId },
    });
    if (!store) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada.`);
    }
    return store;
  }

  async create(userId: string, dto: CreateStoreDto) {
    const existing = await this.prisma.loja.findFirst({
      where: {
        userId,
        nome: { equals: dto.nome.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(`Uma loja com o nome "${dto.nome}" já está cadastrada.`);
    }

    return this.prisma.loja.create({
      data: {
        userId,
        nome: dto.nome.trim(),
        categoria: await this.registeredCategory(userId, dto.categoria),
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateStoreDto) {
    const current = await this.findOne(userId, id);

    if (dto.nome) {
      const existing = await this.prisma.loja.findFirst({
        where: {
          userId,
          nome: { equals: dto.nome.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Outra loja com o nome "${dto.nome}" já está cadastrada.`);
      }
    }

    return this.prisma.loja.update({
      where: { id },
      data: {
        nome: dto.nome ? dto.nome.trim() : undefined,
        categoria: await this.categoryForUpdate(userId, current.categoria, dto.categoria),
      },
    });
  }

  /**
   * A categoria da loja precisa estar cadastrada em Categorias de Lojas.
   * Devolve o nome com a grafia do cadastro (ou null se vier vazia).
   */
  private async registeredCategory(userId: string, categoria?: string | null): Promise<string | null> {
    const nome = categoria?.trim();
    if (!nome) return null;
    const registered = await this.prisma.categoriaLoja.findFirst({
      where: { userId, nome: { equals: nome, mode: 'insensitive' } },
    });
    if (!registered) {
      throw new BadRequestException(`A categoria de loja "${nome}" não está cadastrada. Cadastre-a em Categorias de Lojas.`);
    }
    return registered.nome;
  }

  /** No update só valida se a categoria mudou: lojas antigas com texto solto continuam editáveis. */
  private async categoryForUpdate(userId: string, current: string | null, categoria?: string | null) {
    if (categoria === undefined) return undefined;
    const nome = categoria?.trim() || null;
    if (nome && current && nome.toLowerCase() === current.toLowerCase()) return current;
    return this.registeredCategory(userId, nome);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.loja.delete({
      where: { id },
    });
  }
}

