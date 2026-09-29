import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, PreviewInstallmentsDto, UpdateExpenseDto } from './dto/expense.dto';
import { InvoiceCalculatorHelper } from '../../common/helpers/invoice-calculator.helper';
import { randomUUID } from 'crypto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseDto) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.meioPagamentoId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Meio de pagamento informado não existe.');
    }

    const calculatedTotal =
      dto.valorTotal ?? Number((dto.quantidade * dto.valorUnitario).toFixed(2));
    const numeroParcelas = dto.tipo === 'PARCELADO' ? (dto.numeroParcelas || 1) : 1;
    const purchaseDate = new Date(dto.data);

    // Gerar parcelas com base nas regras de fatura
    const calculatedInstallments = InvoiceCalculatorHelper.calculateInstallments({
      dataCompra: purchaseDate,
      valorTotal: calculatedTotal,
      numeroParcelas,
      modalidade: paymentMethod.modalidade,
      diaFechamento: paymentMethod.diaFechamento,
      diaVencimento: paymentMethod.diaVencimento,
    });

    // O código UUID é gerado automaticamente pelo banco/backend se não fornecido
    const codigo = dto.codigo && dto.codigo.trim() !== '' ? dto.codigo : randomUUID();

    return this.prisma.lancamento.create({
      data: {
        codigo,
        comprador: dto.comprador,
        compradorId: dto.compradorId || null,
        nome: dto.nome,
        loja: dto.loja,
        lojaId: dto.lojaId || null,
        data: purchaseDate,
        categoria: dto.categoria,
        quantidade: dto.quantidade,
        valorUnitario: dto.valorUnitario,
        valorTotal: calculatedTotal,
        meioPagamentoId: dto.meioPagamentoId,
        tipo: dto.tipo,
        numeroParcelas,
        observacoes: dto.observacoes,
        parcelas: {
          create: calculatedInstallments.map((p) => ({
            numero: p.numero,
            totalParcelas: p.totalParcelas,
            valor: p.valor,
            dataVencimento: p.dataVencimento,
            mesReferencia: p.mesReferencia,
          })),
        },
      },
      include: {
        meioPagamento: true,
        lojaRel: true,
        compradorRel: true,
        parcelas: {
          orderBy: { numero: 'asc' },
        },
      },
    });
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    mesReferencia?: string;
    loja?: string;
    lojaId?: string;
    categoriaLoja?: string;
    meioPagamentoId?: string;
    categoria?: string;
    comprador?: string;
    compradorId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (params?.lojaId) {
      where.lojaId = params.lojaId;
    } else if (params?.loja) {
      where.loja = { contains: params.loja, mode: 'insensitive' };
    }

    if (params?.categoriaLoja) {
      where.lojaRel = {
        categoria: { equals: params.categoriaLoja, mode: 'insensitive' },
      };
    }

    if (params?.meioPagamentoId) {
      where.meioPagamentoId = params.meioPagamentoId;
    }

    if (params?.categoria) {
      where.categoria = { contains: params.categoria, mode: 'insensitive' };
    }

    if (params?.compradorId) {
      where.compradorId = params.compradorId;
    } else if (params?.comprador) {
      where.comprador = { contains: params.comprador, mode: 'insensitive' };
    }

    if (params?.mesReferencia) {
      // Filtrar lançamentos que tenham parcelas no mês de referência especificado
      where.parcelas = {
        some: {
          mesReferencia: params.mesReferencia,
        },
      };
    }

    if (params?.search && params.search.trim() !== '') {
      const term = params.search.trim();
      where.OR = [
        { nome: { contains: term, mode: 'insensitive' } },
        { loja: { contains: term, mode: 'insensitive' } },
        { comprador: { contains: term, mode: 'insensitive' } },
        { categoria: { contains: term, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 20);
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.lancamento.count({ where }),
      this.prisma.lancamento.findMany({
        where,
        include: {
          meioPagamento: true,
          lojaRel: true,
          compradorRel: true,
          parcelas: {
            orderBy: { numero: 'asc' },
          },
        },
        orderBy: [
          { data: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findGroupedByDayAndStore(month?: string) {
    const where: any = {};
    if (month) {
      // Filtrar pelo mês da compra (ex: 2026-09)
      const [year, m] = month.split('-').map(Number);
      const startDate = new Date(year, m - 1, 1, 0, 0, 0);
      const endDate = new Date(year, m, 0, 23, 59, 59);
      where.data = {
        gte: startDate,
        lte: endDate,
      };
    }

    const lancamentos = await this.prisma.lancamento.findMany({
      where,
      include: {
        meioPagamento: true,
        parcelas: {
          orderBy: { numero: 'asc' },
        },
      },
      orderBy: [{ data: 'desc' }, { loja: 'asc' }],
    });

    // Agrupar por data (YYYY-MM-DD) e Loja
    const groupedMap = new Map<string, {
      data: string;
      dataFormatada: string;
      loja: string;
      totalValor: number;
      totalItens: number;
      itens: typeof lancamentos;
    }>();

    for (const item of lancamentos) {
      const dateStr = item.data.toISOString().split('T')[0];
      const key = `${dateStr}___${item.loja.trim().toLowerCase()}`;

      if (!groupedMap.has(key)) {
        // Formatar para pt-BR
        const [y, m, d] = dateStr.split('-');
        const dataFormatada = `${d}/${m}/${y}`;

        groupedMap.set(key, {
          data: dateStr,
          dataFormatada,
          loja: item.loja,
          totalValor: 0,
          totalItens: 0,
          itens: [],
        });
      }

      const group = groupedMap.get(key)!;
      group.totalValor = Number((group.totalValor + Number(item.valorTotal)).toFixed(2));
      group.totalItens = Number((group.totalItens + Number(item.quantidade)).toFixed(3));
      group.itens.push(item);
    }

    return Array.from(groupedMap.values());
  }

  async previewInstallments(dto: PreviewInstallmentsDto) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.meioPagamentoId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Meio de pagamento não encontrado.');
    }

    return InvoiceCalculatorHelper.calculateInstallments({
      dataCompra: new Date(dto.dataCompra),
      valorTotal: dto.valorTotal,
      numeroParcelas: dto.numeroParcelas,
      modalidade: paymentMethod.modalidade,
      diaFechamento: paymentMethod.diaFechamento,
      diaVencimento: paymentMethod.diaVencimento,
    });
  }

  async findOne(id: string) {
    const lancamento = await this.prisma.lancamento.findUnique({
      where: { id },
      include: {
        meioPagamento: true,
        lojaRel: true,
        compradorRel: true,
        parcelas: {
          orderBy: { numero: 'asc' },
        },
      },
    });

    if (!lancamento) {
      throw new NotFoundException(`Lançamento com ID ${id} não encontrado.`);
    }

    return lancamento;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    const existing = await this.findOne(id);

    const paymentMethodId = dto.meioPagamentoId ?? existing.meioPagamentoId;
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    if (!paymentMethod) {
      throw new NotFoundException('Meio de pagamento não encontrado.');
    }

    const quantidade = dto.quantidade !== undefined ? dto.quantidade : Number(existing.quantidade);
    const valorUnitario = dto.valorUnitario !== undefined ? dto.valorUnitario : Number(existing.valorUnitario);
    const valorTotal =
      dto.valorTotal ??
      (dto.valorUnitario !== undefined || dto.quantidade !== undefined
        ? Number((quantidade * valorUnitario).toFixed(2))
        : Number(existing.valorTotal));
    const tipo = dto.tipo ?? existing.tipo;
    const numeroParcelas = tipo === 'PARCELADO' ? (dto.numeroParcelas ?? existing.numeroParcelas) : 1;
    const purchaseDate = dto.data ? new Date(dto.data) : existing.data;

    const needsRecalculateInstallments =
      dto.valorTotal !== undefined ||
      dto.valorUnitario !== undefined ||
      dto.quantidade !== undefined ||
      dto.numeroParcelas !== undefined ||
      dto.tipo !== undefined ||
      dto.data !== undefined ||
      dto.meioPagamentoId !== undefined;

    if (needsRecalculateInstallments) {
      const calculatedInstallments = InvoiceCalculatorHelper.calculateInstallments({
        dataCompra: purchaseDate,
        valorTotal,
        numeroParcelas,
        modalidade: paymentMethod.modalidade,
        diaFechamento: paymentMethod.diaFechamento,
        diaVencimento: paymentMethod.diaVencimento,
      });

      return this.prisma.$transaction(async (tx) => {
        await tx.parcela.deleteMany({
          where: { lancamentoId: id },
        });

        return tx.lancamento.update({
          where: { id },
          data: {
            comprador: dto.comprador ?? existing.comprador,
            compradorId: dto.compradorId !== undefined ? dto.compradorId : existing.compradorId,
            nome: dto.nome ?? existing.nome,
            loja: dto.loja ?? existing.loja,
            lojaId: dto.lojaId !== undefined ? dto.lojaId : existing.lojaId,
            categoria: dto.categoria ?? existing.categoria,
            quantidade,
            valorUnitario,
            valorTotal,
            tipo,
            numeroParcelas,
            data: purchaseDate,
            meioPagamentoId: paymentMethodId,
            observacoes: dto.observacoes !== undefined ? dto.observacoes : existing.observacoes,
            parcelas: {
              create: calculatedInstallments.map((p) => ({
                numero: p.numero,
                totalParcelas: p.totalParcelas,
                valor: p.valor,
                dataVencimento: p.dataVencimento,
                mesReferencia: p.mesReferencia,
              })),
            },
          },
          include: {
            meioPagamento: true,
            lojaRel: true,
            compradorRel: true,
            parcelas: {
              orderBy: { numero: 'asc' },
            },
          },
        });
      });
    }

    return this.prisma.lancamento.update({
      where: { id },
      data: {
        comprador: dto.comprador ?? existing.comprador,
        compradorId: dto.compradorId !== undefined ? dto.compradorId : existing.compradorId,
        nome: dto.nome ?? existing.nome,
        loja: dto.loja ?? existing.loja,
        lojaId: dto.lojaId !== undefined ? dto.lojaId : existing.lojaId,
        categoria: dto.categoria ?? existing.categoria,
        observacoes: dto.observacoes !== undefined ? dto.observacoes : existing.observacoes,
      },
      include: {
        meioPagamento: true,
        lojaRel: true,
        compradorRel: true,
        parcelas: {
          orderBy: { numero: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lancamento.delete({
      where: { id },
    });
  }
}
