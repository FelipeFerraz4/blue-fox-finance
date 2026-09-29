import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';

@Injectable()
export class BuyersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly?: boolean) {
    return this.prisma.comprador.findMany({
      where: activeOnly ? { ativo: true } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const buyer = await this.prisma.comprador.findUnique({
      where: { id },
    });
    if (!buyer) {
      throw new NotFoundException(`Comprador com ID ${id} não encontrado.`);
    }
    return buyer;
  }

  async create(dto: CreateBuyerDto) {
    const existing = await this.prisma.comprador.findFirst({
      where: { nome: { equals: dto.nome.trim(), mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Um comprador com o nome "${dto.nome}" já está cadastrado.`);
    }

    return this.prisma.comprador.create({
      data: {
        nome: dto.nome.trim(),
        email: dto.email?.trim() || null,
        ativo: dto.ativo !== undefined ? dto.ativo : true,
      },
    });
  }

  async update(id: string, dto: UpdateBuyerDto) {
    await this.findOne(id);

    if (dto.nome) {
      const existing = await this.prisma.comprador.findFirst({
        where: {
          nome: { equals: dto.nome.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Outro comprador com o nome "${dto.nome}" já está cadastrado.`);
      }
    }

    return this.prisma.comprador.update({
      where: { id },
      data: {
        nome: dto.nome ? dto.nome.trim() : undefined,
        email: dto.email !== undefined ? (dto.email?.trim() || null) : undefined,
        ativo: dto.ativo !== undefined ? dto.ativo : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.comprador.delete({
      where: { id },
    });
  }
}
