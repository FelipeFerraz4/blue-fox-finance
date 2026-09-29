import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.loja.findMany({
      where: category ? { categoria: { equals: category, mode: 'insensitive' } } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async getCategories(): Promise<string[]> {
    const stores = await this.prisma.loja.findMany({
      select: { categoria: true },
      distinct: ['categoria'],
      where: {
        categoria: { not: null },
      },
    });

    return stores
      .map((s) => s.categoria)
      .filter((c): c is string => Boolean(c && c.trim() !== ''))
      .sort();
  }

  async findOne(id: string) {
    const store = await this.prisma.loja.findUnique({
      where: { id },
    });
    if (!store) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada.`);
    }
    return store;
  }

  async create(dto: CreateStoreDto) {
    const existing = await this.prisma.loja.findUnique({
      where: { nome: dto.nome.trim() },
    });

    if (existing) {
      throw new ConflictException(`Uma loja com o nome "${dto.nome}" já está cadastrada.`);
    }

    return this.prisma.loja.create({
      data: {
        nome: dto.nome.trim(),
        categoria: dto.categoria?.trim() || null,
      },
    });
  }

  async update(id: string, dto: UpdateStoreDto) {
    await this.findOne(id);

    return this.prisma.loja.update({
      where: { id },
      data: {
        nome: dto.nome ? dto.nome.trim() : undefined,
        categoria: dto.categoria !== undefined ? (dto.categoria?.trim() || null) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.loja.delete({
      where: { id },
    });
  }
}
