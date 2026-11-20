import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ModalidadePagamento, RecorrenciaConta } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BillScheduleHelper } from '../../common/helpers/bill-schedule.helper';
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
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.paymentMethod.create({
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

      if (created.modalidade === ModalidadePagamento.CREDITO && created.diaVencimento) {
        const [y, m] = BillScheduleHelper.currentMonth().split('-').map(Number);
        await tx.contaPagar.create({
          data: {
            userId,
            nome: `Fatura ${created.nome}`,
            recorrencia: RecorrenciaConta.MENSAL,
            diaVencimento: created.diaVencimento,
            meioPagamentoId: created.id,
            lembrarDiasAntes: 2,
            dataInicio: new Date(y, m - 1, 1, 12, 0, 0),
            ativo: created.ativo,
          },
        });
      }

      return created;
    });
  }

  async update(userId: string, id: string, dto: UpdatePaymentMethodDto) {
    const existing = await this.findOne(userId, id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.paymentMethod.update({
        where: { id },
        data: dto,
      });

      const linkedBill = await tx.contaPagar.findFirst({
        where: { userId, meioPagamentoId: id },
      });

      if (updated.modalidade === ModalidadePagamento.CREDITO && updated.diaVencimento) {
        if (linkedBill) {
          const defaultOldName = `Fatura ${existing.nome}`;
          const newName = linkedBill.nome === defaultOldName ? `Fatura ${updated.nome}` : linkedBill.nome;
          const updatedBill = await tx.contaPagar.update({
            where: { id: linkedBill.id },
            data: {
              nome: newName,
              diaVencimento: updated.diaVencimento,
              ativo: updated.ativo,
            },
          });

          if (linkedBill.diaVencimento !== updated.diaVencimento) {
            const currentMonth = BillScheduleHelper.currentMonth();
            await tx.pagamentoConta.deleteMany({
              where: {
                contaId: updatedBill.id,
                userId,
                pagoEm: null,
                mesReferencia: { gte: currentMonth },
              },
            });
          }
        } else {
          const [y, m] = BillScheduleHelper.currentMonth().split('-').map(Number);
          await tx.contaPagar.create({
            data: {
              userId,
              nome: `Fatura ${updated.nome}`,
              recorrencia: RecorrenciaConta.MENSAL,
              diaVencimento: updated.diaVencimento,
              meioPagamentoId: updated.id,
              lembrarDiasAntes: 2,
              dataInicio: new Date(y, m - 1, 1, 12, 0, 0),
              ativo: updated.ativo,
            },
          });
        }
      } else if (linkedBill) {
        await tx.contaPagar.delete({ where: { id: linkedBill.id } });
      }

      return updated;
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
      await this.prisma.lancamento.deleteMany({
        where: { meioPagamentoId: id, userId },
      });
    }

    await this.prisma.contaPagar.deleteMany({
      where: { userId, meioPagamentoId: id },
    });

    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}
