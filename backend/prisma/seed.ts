import { PrismaClient, ModalidadePagamento } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Meios de Pagamento padrão...');

  const defaultMethods = [
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
      console.log(`✅ Meio de pagamento criado: ${method.nome}`);
    } else {
      console.log(`ℹ️ Meio de pagamento já existente: ${method.nome}`);
    }
  }

  console.log('✨ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
