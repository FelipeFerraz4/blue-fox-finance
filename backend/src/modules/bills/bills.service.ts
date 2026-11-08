import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContaPagar, ModalidadePagamento, PagamentoConta, Prisma, RecorrenciaConta } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BillScheduleHelper, BillStatus } from '../../common/helpers/bill-schedule.helper';
import { CreateBillDto, PayBillOccurrenceDto, UpdateBillDto } from './dto/bill.dto';

const BILL_INCLUDE = {
  meioPagamento: { select: { id: true, nome: true, instituicaoBanco: true, diaVencimento: true } },
} satisfies Prisma.ContaPagarInclude;

type OccurrenceWithBill = PagamentoConta & { conta: ContaPagar };

export interface BillOccurrenceView {
  id: string;
  contaId: string;
  nome: string;
  categoria: string | null;
  recorrencia: RecorrenciaConta;
  meioPagamentoId: string | null;
  mesReferencia: string;
  dataVencimento: Date;
  valor: number | null; // pago: valor pago; pendente: fatura do cartão ou valor previsto
  valorDaFatura: boolean; // true quando o valor vem da fatura calculada do cartão
  valorPago: number | null;
  pagoEm: Date | null;
  status: BillStatus;
  diasParaVencer: number;
}

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Contas (regras)
  // ---------------------------------------------------------------------------

  findAll(userId: string) {
    return this.prisma.contaPagar.findMany({
      where: { userId },
      include: BILL_INCLUDE,
      orderBy: [{ ativo: 'desc' }, { nome: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const bill = await this.prisma.contaPagar.findFirst({
      where: { id, userId },
      include: BILL_INCLUDE,
    });
    if (!bill) {
      throw new NotFoundException(`Conta com ID ${id} não encontrada.`);
    }
    return bill;
  }

  async create(userId: string, dto: CreateBillDto) {
    const data = await this.normalize(userId, dto);
    return this.prisma.contaPagar.create({
      data: { ...data, userId },
      include: BILL_INCLUDE,
    });
  }

  async update(userId: string, id: string, dto: UpdateBillDto) {
    const existing = await this.findOne(userId, id);
    const merged: CreateBillDto = {
      nome: dto.nome ?? existing.nome,
      categoria: dto.categoria !== undefined ? dto.categoria : existing.categoria,
      recorrencia: dto.recorrencia ?? existing.recorrencia,
      diaVencimento: dto.diaVencimento !== undefined ? dto.diaVencimento : existing.diaVencimento,
      mesVencimento: dto.mesVencimento !== undefined ? dto.mesVencimento : existing.mesVencimento,
      dataUnica:
        dto.dataUnica !== undefined ? dto.dataUnica : existing.dataUnica?.toISOString() ?? null,
      valorPrevisto:
        dto.valorPrevisto !== undefined
          ? dto.valorPrevisto
          : existing.valorPrevisto !== null
            ? Number(existing.valorPrevisto)
            : null,
      meioPagamentoId:
        dto.meioPagamentoId !== undefined ? dto.meioPagamentoId : existing.meioPagamentoId,
      lembrarDiasAntes: dto.lembrarDiasAntes ?? existing.lembrarDiasAntes,
      dataInicio: dto.dataInicio ?? existing.dataInicio.toISOString(),
      ativo: dto.ativo ?? existing.ativo,
      observacoes: dto.observacoes !== undefined ? dto.observacoes : existing.observacoes,
    };
    const data = await this.normalize(userId, merged);
    const currentMonth = BillScheduleHelper.currentMonth();
    const startMonth = BillScheduleHelper.monthOf(data.dataInicio);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.contaPagar.update({
        where: { id },
        data,
        include: BILL_INCLUDE,
      });
      // Ocorrências pendentes do mês atual em diante (e antes do novo início) são
      // recriadas na próxima leitura com a regra nova. Pagas e atrasadas ficam como estão.
      await tx.pagamentoConta.deleteMany({
        where: {
          contaId: id,
          userId,
          pagoEm: null,
          OR: [{ mesReferencia: { gte: currentMonth } }, { mesReferencia: { lt: startMonth } }],
        },
      });
      return updated;
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.contaPagar.delete({ where: { id } });
  }

  // ---------------------------------------------------------------------------
  // Ocorrências
  // ---------------------------------------------------------------------------

  async getOccurrences(userId: string, month?: string) {
    const currentMonth = BillScheduleHelper.currentMonth();
    const mesReferencia = BillScheduleHelper.isValidMonth(month) ? month : currentMonth;
    await this.ensureOccurrences(userId, mesReferencia > currentMonth ? mesReferencia : currentMonth);

    const today = BillScheduleHelper.today();
    const [doMes, atrasadasAnteriores] = await Promise.all([
      this.prisma.pagamentoConta.findMany({
        where: { userId, mesReferencia },
        include: { conta: true },
        orderBy: { dataVencimento: 'asc' },
      }),
      this.prisma.pagamentoConta.findMany({
        where: { userId, pagoEm: null, mesReferencia: { lt: mesReferencia } },
        include: { conta: true },
        orderBy: { dataVencimento: 'asc' },
      }),
    ]);

    const views = await this.toViews(userId, [...doMes, ...atrasadasAnteriores], today);
    const ocorrencias = views.slice(0, doMes.length);
    const anteriores = views
      .slice(doMes.length)
      .filter((o) => o.status === 'ATRASADA');

    const sum = (items: BillOccurrenceView[]) =>
      Number(items.reduce((acc, o) => acc + (o.valor ?? 0), 0).toFixed(2));

    return {
      mesReferencia,
      ocorrencias,
      atrasadasAnteriores: anteriores,
      totais: {
        previsto: sum(ocorrencias),
        pago: sum(ocorrencias.filter((o) => o.status === 'PAGA')),
        pendente: sum(ocorrencias.filter((o) => o.status !== 'PAGA')),
        quantidadePendente: ocorrencias.filter((o) => o.status !== 'PAGA').length,
      },
    };
  }

  /** Pago × pendente por mês do ano (usado pela página de Análises). */
  async getYearSummary(userId: string, year: number) {
    const currentMonth = BillScheduleHelper.currentMonth();
    const lastMonth = `${year}-12`;
    await this.ensureOccurrences(userId, lastMonth > currentMonth ? lastMonth : currentMonth);

    const occurrences = await this.prisma.pagamentoConta.findMany({
      where: { userId, mesReferencia: { startsWith: `${year}-` } },
      include: { conta: true },
    });
    const views = await this.toViews(userId, occurrences, BillScheduleHelper.today());

    return Array.from({ length: 12 }, (_, i) => {
      const month = `${year}-${String(i + 1).padStart(2, '0')}`;
      const items = views.filter((o) => o.mesReferencia === month);
      const pagas = items.filter((o) => o.status === 'PAGA');
      const pendentes = items.filter((o) => o.status !== 'PAGA');
      const sum = (list: BillOccurrenceView[]) =>
        Number(list.reduce((acc, o) => acc + (o.valor ?? 0), 0).toFixed(2));
      return {
        mes: i + 1,
        pago: sum(pagas),
        pendente: sum(pendentes),
        quantidadePaga: pagas.length,
        quantidadePendente: pendentes.length,
        quantidadeAtrasada: pendentes.filter((o) => o.status === 'ATRASADA').length,
        semValor: pendentes.filter((o) => o.valor === null).length,
      };
    });
  }

  /** Atrasadas, vencendo hoje e próximas (janela lembrarDiasAntes). Base dos avisos. */
  async getAlerts(userId: string) {
    const currentMonth = BillScheduleHelper.currentMonth();
    // A janela de aviso (até 30 dias) pode cruzar a virada do mês
    const untilMonth = BillScheduleHelper.addMonths(currentMonth, 1);
    await this.ensureOccurrences(userId, untilMonth);

    const pendentes = await this.prisma.pagamentoConta.findMany({
      where: { userId, pagoEm: null, mesReferencia: { lte: untilMonth } },
      include: { conta: true },
      orderBy: { dataVencimento: 'asc' },
    });
    const views = await this.toViews(userId, pendentes, BillScheduleHelper.today());

    const atrasadas = views.filter((o) => o.status === 'ATRASADA');
    const venceHoje = views.filter((o) => o.status === 'VENCE_HOJE');
    const proximas = views.filter((o) => o.status === 'PROXIMA');
    return {
      atrasadas,
      venceHoje,
      proximas,
      total: atrasadas.length + venceHoje.length + proximas.length,
    };
  }

  async pay(userId: string, occurrenceId: string, dto: PayBillOccurrenceDto) {
    const occurrence = await this.findOccurrence(userId, occurrenceId);
    const today = BillScheduleHelper.today();
    const [view] = await this.toViews(userId, [{ ...occurrence, pagoEm: null }], today);

    const valorPago = dto.valorPago ?? view.valor;
    if (valorPago === null || valorPago === undefined) {
      throw new BadRequestException('Informe o valor pago: esta conta não tem valor previsto.');
    }
    const pagoEm = this.dateAtNoon(dto.pagoEm ?? today);

    await this.prisma.$transaction(async (tx) => {
      await tx.pagamentoConta.update({
        where: { id: occurrence.id },
        data: { pagoEm, valorPago },
      });
      await this.setInvoiceInstallmentsPaid(tx, userId, occurrence, true);
    });

    return this.viewOf(userId, occurrence.id);
  }

  async unpay(userId: string, occurrenceId: string) {
    const occurrence = await this.findOccurrence(userId, occurrenceId);

    await this.prisma.$transaction(async (tx) => {
      await tx.pagamentoConta.update({
        where: { id: occurrence.id },
        data: { pagoEm: null, valorPago: null },
      });
      await this.setInvoiceInstallmentsPaid(tx, userId, occurrence, false);
    });

    return this.viewOf(userId, occurrence.id);
  }

  // ---------------------------------------------------------------------------
  // Internos
  // ---------------------------------------------------------------------------

  /**
   * Cria as ocorrências que faltam, do mês de início de cada conta ativa até `untilMonth`.
   * Idempotente (unique contaId + mesReferencia). Garante que meses nunca abertos
   * também apareçam como atrasados.
   */
  private async ensureOccurrences(userId: string, untilMonth: string) {
    const bills = await this.prisma.contaPagar.findMany({
      where: { userId, ativo: true },
    });

    const rows: Prisma.PagamentoContaCreateManyInput[] = [];
    for (const bill of bills) {
      const startMonth = BillScheduleHelper.monthOf(bill.dataInicio);
      for (const month of BillScheduleHelper.monthRange(startMonth, untilMonth)) {
        const dataVencimento = BillScheduleHelper.dueDateFor(bill, month);
        if (!dataVencimento) continue;
        rows.push({
          userId,
          contaId: bill.id,
          mesReferencia: month,
          dataVencimento,
          valorPrevisto: bill.valorPrevisto,
        });
      }
    }

    if (rows.length > 0) {
      await this.prisma.pagamentoConta.createMany({ data: rows, skipDuplicates: true });
    }
  }

  /** Converte ocorrências em views, buscando a fatura do cartão de uma vez só. */
  private async toViews(
    userId: string,
    occurrences: OccurrenceWithBill[],
    today: string,
  ): Promise<BillOccurrenceView[]> {
    const invoiceTotals = await this.invoiceTotals(
      userId,
      occurrences.filter((o) => !o.pagoEm && o.conta.meioPagamentoId),
    );

    return occurrences.map((o) => {
      const cardId = o.conta.meioPagamentoId;
      const fromInvoice = !o.pagoEm && !!cardId;
      let valor: number | null;
      if (o.pagoEm) {
        valor = o.valorPago !== null ? Number(o.valorPago) : null;
      } else if (cardId) {
        valor = invoiceTotals.get(`${cardId}|${o.mesReferencia}`) ?? 0;
      } else {
        valor = o.valorPrevisto !== null ? Number(o.valorPrevisto) : null;
      }

      return {
        id: o.id,
        contaId: o.contaId,
        nome: o.conta.nome,
        categoria: o.conta.categoria,
        recorrencia: o.conta.recorrencia,
        meioPagamentoId: cardId,
        mesReferencia: o.mesReferencia,
        dataVencimento: o.dataVencimento,
        valor,
        valorDaFatura: fromInvoice,
        valorPago: o.valorPago !== null ? Number(o.valorPago) : null,
        pagoEm: o.pagoEm,
        status: BillScheduleHelper.statusOf(o, o.conta.lembrarDiasAntes, today),
        diasParaVencer: BillScheduleHelper.daysUntil(o.dataVencimento, today),
      };
    });
  }

  /** Soma das parcelas por cartão + mês (mesma regra de fatura do dashboard). */
  private async invoiceTotals(userId: string, occurrences: OccurrenceWithBill[]) {
    const totals = new Map<string, number>();
    if (occurrences.length === 0) return totals;

    const cardIds = [...new Set(occurrences.map((o) => o.conta.meioPagamentoId!))];
    const months = [...new Set(occurrences.map((o) => o.mesReferencia))];

    const parcelas = await this.prisma.parcela.findMany({
      where: {
        mesReferencia: { in: months },
        lancamento: { userId, meioPagamentoId: { in: cardIds } },
      },
      select: { valor: true, mesReferencia: true, lancamento: { select: { meioPagamentoId: true } } },
    });

    for (const p of parcelas) {
      const key = `${p.lancamento.meioPagamentoId}|${p.mesReferencia}`;
      totals.set(key, Number(((totals.get(key) ?? 0) + Number(p.valor)).toFixed(2)));
    }
    return totals;
  }

  private async setInvoiceInstallmentsPaid(
    tx: Prisma.TransactionClient,
    userId: string,
    occurrence: OccurrenceWithBill,
    pago: boolean,
  ) {
    const cardId = occurrence.conta.meioPagamentoId;
    if (!cardId) return;
    await tx.parcela.updateMany({
      where: {
        mesReferencia: occurrence.mesReferencia,
        lancamento: { userId, meioPagamentoId: cardId },
      },
      data: { pago },
    });
  }

  private async findOccurrence(userId: string, id: string): Promise<OccurrenceWithBill> {
    const occurrence = await this.prisma.pagamentoConta.findFirst({
      where: { id, userId },
      include: { conta: true },
    });
    if (!occurrence) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado.`);
    }
    return occurrence;
  }

  private async viewOf(userId: string, id: string) {
    const occurrence = await this.findOccurrence(userId, id);
    const [view] = await this.toViews(userId, [occurrence], BillScheduleHelper.today());
    return view;
  }

  /**
   * Valida e limpa os campos conforme a recorrência. Conta vinculada precisa ser um
   * cartão de crédito do próprio usuário; sem dia informado, usa o vencimento do cartão.
   */
  private async normalize(userId: string, dto: CreateBillDto) {
    let diaVencimento = dto.diaVencimento ?? null;

    if (dto.meioPagamentoId) {
      const card = await this.prisma.paymentMethod.findFirst({
        where: { id: dto.meioPagamentoId, userId },
      });
      if (!card) {
        throw new NotFoundException('Cartão informado não existe ou não pertence ao seu usuário.');
      }
      if (card.modalidade !== ModalidadePagamento.CREDITO) {
        throw new BadRequestException('Só é possível vincular a conta a um cartão de crédito.');
      }
      diaVencimento = diaVencimento ?? card.diaVencimento;
    }

    const recorrencia = dto.recorrencia;
    const dataUnica = recorrencia === RecorrenciaConta.UNICA && dto.dataUnica ? new Date(dto.dataUnica) : null;

    if (recorrencia === RecorrenciaConta.UNICA && !dataUnica) {
      throw new BadRequestException('Informe a data de vencimento da conta avulsa.');
    }
    if (recorrencia !== RecorrenciaConta.UNICA && !diaVencimento) {
      throw new BadRequestException(
        'Informe o dia de vencimento (o cartão vinculado não tem dia de vencimento cadastrado).',
      );
    }
    if (recorrencia === RecorrenciaConta.ANUAL && !dto.mesVencimento) {
      throw new BadRequestException('Informe o mês de vencimento da conta anual.');
    }

    // Conta avulsa começa no próprio mês; as demais, no mês informado ou no atual
    const dataInicio = this.firstDayOfMonth(dataUnica ? dto.dataUnica! : dto.dataInicio);

    return {
      nome: dto.nome.trim(),
      categoria: dto.categoria?.trim() || null,
      recorrencia,
      diaVencimento: recorrencia === RecorrenciaConta.UNICA ? null : diaVencimento,
      mesVencimento: recorrencia === RecorrenciaConta.ANUAL ? dto.mesVencimento! : null,
      dataUnica,
      valorPrevisto: dto.valorPrevisto ?? null,
      meioPagamentoId: dto.meioPagamentoId || null,
      lembrarDiasAntes: dto.lembrarDiasAntes ?? 2,
      dataInicio,
      ativo: dto.ativo ?? true,
      observacoes: dto.observacoes?.trim() || null,
    };
  }

  private firstDayOfMonth(date?: string): Date {
    const month = date ? date.slice(0, 7) : BillScheduleHelper.currentMonth();
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1, 12, 0, 0);
  }

  private dateAtNoon(date: string): Date {
    const [y, m, d] = date.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
}
