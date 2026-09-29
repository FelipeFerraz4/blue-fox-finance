export interface InstallmentCalculationInput {
  dataCompra: Date;
  valorTotal: number;
  numeroParcelas: number;
  modalidade: string;
  diaFechamento?: number | null;
  diaVencimento?: number | null;
}

export interface CalculatedInstallment {
  numero: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: Date;
  mesReferencia: string; // YYYY-MM
}

export class InvoiceCalculatorHelper {
  /**
   * Calcula as parcelas, datas de vencimento e meses de referência
   * respeitando as regras de fatura (dia de fechamento e vencimento) do cartão.
   */
  static calculateInstallments(input: InstallmentCalculationInput): CalculatedInstallment[] {
    const {
      dataCompra,
      valorTotal,
      numeroParcelas,
      modalidade,
      diaFechamento,
      diaVencimento,
    } = input;

    const total = Number(valorTotal);
    const n = Math.max(1, numeroParcelas || 1);

    // Calcular valores das parcelas com precisão de 2 casas decimais
    const baseCents = Math.floor((total * 100) / n);
    const remainderCents = Math.round(total * 100 - baseCents * n);

    const installments: CalculatedInstallment[] = [];

    // Determinar a primeira data de vencimento
    const firstDueDate = this.calculateFirstDueDate(
      dataCompra,
      modalidade,
      diaFechamento,
      diaVencimento,
    );

    const baseYear = firstDueDate.getFullYear();
    const baseMonth = firstDueDate.getMonth();
    const targetDay = firstDueDate.getDate();

    for (let i = 1; i <= n; i++) {
      // Ajuste de centavos na primeira parcela
      const installmentCents = i === 1 ? baseCents + remainderCents : baseCents;
      const valor = installmentCents / 100;

      // Calcular o mês de cada parcela (i - 1 meses após a primeira)
      const dueDate = new Date(baseYear, baseMonth + (i - 1), targetDay, 12, 0, 0);

      // Tratamento para meses com menos dias (ex: dia 31 em fevereiro)
      // Se estourar o mês, recua para o último dia do mês desejado
      const expectedMonth = (baseMonth + (i - 1)) % 12;
      const normalizedExpectedMonth = expectedMonth < 0 ? expectedMonth + 12 : expectedMonth;
      if (dueDate.getMonth() !== normalizedExpectedMonth) {
        // Obter último dia do mês esperado
        const lastDayOfMonth = new Date(baseYear, baseMonth + i, 0, 12, 0, 0);
        dueDate.setTime(lastDayOfMonth.getTime());
      }

      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const mesReferencia = `${year}-${month}`;

      installments.push({
        numero: i,
        totalParcelas: n,
        valor,
        dataVencimento: dueDate,
        mesReferencia,
      });
    }

    return installments;
  }

  /**
   * Determina a data do primeiro vencimento com base nas regras de fatura do cartão
   */
  private static calculateFirstDueDate(
    dataCompra: Date,
    modalidade: string,
    diaFechamento?: number | null,
    diaVencimento?: number | null,
  ): Date {
    const purchase = new Date(dataCompra);
    const purchaseYear = purchase.getFullYear();
    const purchaseMonth = purchase.getMonth(); // 0 a 11
    const purchaseDay = purchase.getDate();

    // Se for Cartão de Crédito e tiver regras de fechamento e vencimento
    if (
      modalidade === 'CREDITO' &&
      diaFechamento &&
      diaVencimento &&
      diaFechamento > 0 &&
      diaVencimento > 0
    ) {
      let billingMonth = purchaseMonth;
      let billingYear = purchaseYear;

      // Se a compra foi feita no dia ou após o fechamento da fatura,
      // entra na fatura do mês seguinte ("melhor dia de compra")
      if (purchaseDay >= diaFechamento) {
        billingMonth += 1;
      }

      // Determinar o mês do vencimento dessa fatura:
      // Se diaVencimento <= diaFechamento, o vencimento é no mês seguinte ao mês da fatura (ex: fecha 25/out, vence 05/nov)
      // Se diaVencimento > diaFechamento, o vencimento é no mesmo mês da fatura (ex: fecha 10/out, vence 20/out)
      let dueMonth = billingMonth;
      let dueYear = billingYear;

      if (diaVencimento <= diaFechamento) {
        dueMonth += 1;
      }

      return new Date(dueYear, dueMonth, diaVencimento, 12, 0, 0);
    }

    // Para outros meios de pagamento (Débito, Dinheiro, Pix, Boleto sem regra de fatura)
    // Primeiro vencimento é na própria data da compra
    return new Date(purchaseYear, purchaseMonth, purchaseDay, 12, 0, 0);
  }
}
