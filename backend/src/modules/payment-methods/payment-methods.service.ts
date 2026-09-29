import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive: boolean = false) {
    return this.prisma.paymentMethod.findMany({
      where: onlyActive ? { ativo: true } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!method) {
      throw new NotFoundException(`Meio de pagamento com ID ${id} não encontrado.`);
    }
    return method;
  }

  async create(dto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: {
        nome: dto.nome,
        modalidade: dto.modalidade,
        diaFechamento: dto.diaFechamento || null,
        diaVencimento: dto.diaVencimento || null,
        instituicaoBanco: dto.instituicaoBanco,
        ativo: dto.ativo ?? true,
      },
    });
  }

  async update(id: string, dto: UpdatePaymentMethodDto) {
    await this.findOne(id);
    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, force: boolean = false) {
    await this.findOne(id);
    const countExpenses = await this.prisma.lancamento.count({
      where: { meioPagamentoId: id },
    });

    if (countExpenses > 0) {
      if (!force) {
        throw new BadRequestException(
          `Este meio de pagamento possui ${countExpenses} lançamento(s) vinculado(s).`,
        );
      }
      // Se force for verdadeiro, remove os lançamentos vinculados (as parcelas são removidas em cascata)
      await this.prisma.lancamento.deleteMany({
        where: { meioPagamentoId: id },
      });
    }

    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}
