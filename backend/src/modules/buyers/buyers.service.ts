import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';

@Injectable()
export class BuyersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, activeOnly?: boolean) {
    return this.prisma.comprador.findMany({
      where: {
        userId,
        ...(activeOnly ? { ativo: true } : {}),
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const buyer = await this.prisma.comprador.findFirst({
      where: { id, userId },
    });
    if (!buyer) {
      throw new NotFoundException(`Comprador com ID ${id} não encontrado.`);
    }
    return buyer;
  }

  async create(userId: string, dto: CreateBuyerDto) {
    const existing = await this.prisma.comprador.findFirst({
      where: {
        userId,
        nome: { equals: dto.nome.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(`Um comprador com o nome "${dto.nome}" já está cadastrado.`);
    }

    return this.prisma.comprador.create({
      data: {
        userId,
        nome: dto.nome.trim(),
        email: dto.email?.trim() || null,
        ativo: dto.ativo !== undefined ? dto.ativo : true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateBuyerDto) {
    await this.findOne(userId, id);

    if (dto.nome) {
      const existing = await this.prisma.comprador.findFirst({
        where: {
          userId,
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

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.comprador.delete({
      where: { id },
    });
  }
}

