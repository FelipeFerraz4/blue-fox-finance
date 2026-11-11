import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, PreviewInstallmentsDto, UpdateExpenseDto } from './dto/expense.dto';
import { InvoiceCalculatorHelper } from '../../common/helpers/invoice-calculator.helper';
import { randomUUID } from 'crypto';
import { OrigemLancamento } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  /** `origem` indica por onde o lançamento entrou (site ou bot); não é aceito do cliente. */
  async create(userId: string, dto: CreateExpenseDto, origem: OrigemLancamento = OrigemLancamento.WEB) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: dto.meioPagamentoId, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Meio de pagamento informado não existe ou não pertence ao seu usuário.');
    }

    const buyer = await this.registeredBuyer(userId, dto.compradorId);
    const store = await this.registeredStore(userId, dto.lojaId);
    const categoria = await this.registeredCategory(userId, dto.categoria);

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
        userId,
        codigo,
        comprador: buyer.nome,
        compradorId: buyer.id,
        nome: dto.nome,
        loja: store.nome,
        lojaId: store.id,
        data: purchaseDate,
        categoria,
        quantidade: dto.quantidade,
        valorUnitario: dto.valorUnitario,
        valorTotal: calculatedTotal,
        meioPagamentoId: dto.meioPagamentoId,
        tipo: dto.tipo,
        numeroParcelas,
        observacoes: dto.observacoes,
        origem,
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

  async findAll(
    userId: string,
    params?: {
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
    },
  ) {
    const where: any = { userId };

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

  async findGroupedByDayAndStore(userId: string, month?: string) {
    const where: any = { userId };
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

  async previewInstallments(userId: string, dto: PreviewInstallmentsDto) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: dto.meioPagamentoId, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Meio de pagamento não encontrado ou não pertence ao seu usuário.');
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

  async findOne(userId: string, id: string) {
    const lancamento = await this.prisma.lancamento.findFirst({
      where: { id, userId },
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

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const existing = await this.findOne(userId, id);

    const paymentMethodId = dto.meioPagamentoId ?? existing.meioPagamentoId;
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });
    if (!paymentMethod) {
      throw new NotFoundException('Meio de pagamento não encontrado ou não pertence ao seu usuário.');
    }

    // Ao alterar comprador, loja ou categoria, eles precisam estar cadastrados
    const buyer =
      dto.compradorId !== undefined || dto.comprador !== undefined
        ? await this.registeredBuyer(userId, dto.compradorId)
        : null;
    const store =
      dto.lojaId !== undefined || dto.loja !== undefined ? await this.registeredStore(userId, dto.lojaId) : null;
    const categoria = dto.categoria !== undefined ? await this.registeredCategory(userId, dto.categoria) : null;
    const references = {
      comprador: buyer?.nome ?? existing.comprador,
      compradorId: buyer ? buyer.id : existing.compradorId,
      loja: store?.nome ?? existing.loja,
      lojaId: store ? store.id : existing.lojaId,
      categoria: categoria ?? existing.categoria,
    };

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
            ...references,
            nome: dto.nome ?? existing.nome,
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
        ...references,
        nome: dto.nome ?? existing.nome,
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

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.lancamento.delete({
      where: { id },
    });
  }

  // ---------------------------------------------------------------------------
  // Comprador, loja e categoria: só cadastrados (os nomes vêm do cadastro)
  // ---------------------------------------------------------------------------

  private async registeredBuyer(userId: string, id?: string | null) {
    const buyer = id ? await this.prisma.comprador.findFirst({ where: { id, userId } }) : null;
    if (!buyer) throw new BadRequestException('Selecione um comprador cadastrado.');
    return buyer;
  }

  private async registeredStore(userId: string, id?: string | null) {
    const store = id ? await this.prisma.loja.findFirst({ where: { id, userId } }) : null;
    if (!store) throw new BadRequestException('Selecione uma loja cadastrada.');
    return store;
  }

  /** Devolve o nome como está no cadastro (sem diferenciar maiúsculas). */
  private async registeredCategory(userId: string, nome?: string | null) {
    const value = nome?.trim();
    const category = value
      ? await this.prisma.categoriaItem.findFirst({ where: { userId, nome: { equals: value, mode: 'insensitive' } } })
      : null;
    if (!category) throw new BadRequestException(`A categoria "${value ?? ''}" não está cadastrada.`);
    return category.nome;
  }
}
