import { PrismaClient, ModalidadePagamento } from '@prisma/client';

export async function seedPagamentos(prisma: PrismaClient) {
  console.log('💳 Iniciando seed de Meios de Pagamento padrão...');

  const defaultMethods: Array<{
    nome: string;
    modalidade: ModalidadePagamento;
    instituicaoBanco: string;
    diaFechamento: number | null;
    diaVencimento: number | null;
  }> = [
    {
      nome: 'Dinheiro',
      modalidade: ModalidadePagamento.DINHEIRO_CONTA,
      instituicaoBanco: 'Carteira',
      diaFechamento: null,
      diaVencimento: null,
    },
    {
      nome: 'Pix',
      modalidade: ModalidadePagamento.DINHEIRO_CONTA,
      instituicaoBanco: 'Geral',
      diaFechamento: null,
      diaVencimento: null,
    },
    {
      nome: 'Boleto Bancário',
      modalidade: ModalidadePagamento.OUTRO,
      instituicaoBanco: 'Geral',
      diaFechamento: null,
      diaVencimento: null,
    },
    {
      nome: 'TED / Transferência',
      modalidade: ModalidadePagamento.DINHEIRO_CONTA,
      instituicaoBanco: 'Geral',
      diaFechamento: null,
      diaVencimento: null,
    },
  ];

  for (const method of defaultMethods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { nome: method.nome },
    });

    if (!existing) {
      await prisma.paymentMethod.create({
        data: method,
      });
      console.log(`  ✅ Meio de pagamento criado: ${method.nome}`);
    } else {
      console.log(`  ℹ️ Meio de pagamento já existente: ${method.nome}`);
    }
  }
}
