import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, onlyActive: boolean = false) {
    return this.prisma.paymentMethod.findMany({
      where: {
        userId,
        ...(onlyActive ? { ativo: true } : {}),
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const method = await this.prisma.paymentMethod.findFirst({
      where: { id, userId },
    });
    if (!method) {
      throw new NotFoundException(`Meio de pagamento com ID ${id} não encontrado.`);
    }
    return method;
  }

  async create(userId: string, dto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: {
        userId,
        nome: dto.nome,
        modalidade: dto.modalidade,
        diaFechamento: dto.diaFechamento || null,
        diaVencimento: dto.diaVencimento || null,
        instituicaoBanco: dto.instituicaoBanco,
        ativo: dto.ativo ?? true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdatePaymentMethodDto) {
    await this.findOne(userId, id);
    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string, force: boolean = false) {
    await this.findOne(userId, id);
    const countExpenses = await this.prisma.lancamento.count({
      where: { meioPagamentoId: id, userId },
    });

    if (countExpenses > 0) {
      if (!force) {
        throw new BadRequestException(
          `Este meio de pagamento possui ${countExpenses} lançamento(s) vinculado(s).`,
        );
      }
      // Se force for verdadeiro, remove os lançamentos vinculados do usuário
      await this.prisma.lancamento.deleteMany({
        where: { meioPagamentoId: id, userId },
      });
    }

    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}

