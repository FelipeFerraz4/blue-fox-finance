const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Meios de Pagamento padrão...');

  const defaultMethods = [
    {
      nome: 'Dinheiro',
      modalidade: 'DINHEIRO_CONTA',
      instituicaoBanco: 'Carteira',
      diaFechamento: null,
      diaVencimento: null,
    },
    {
      nome: 'Pix',
      modalidade: 'DINHEIRO_CONTA',
      instituicaoBanco: 'Geral',
      diaFechamento: null,
      diaVencimento: null,
    },
    {
      nome: 'Boleto Bancário',
      modalidade: 'OUTRO',
      instituicaoBanco: 'Geral',
      diaFechamento: null,
      diaVencimento: null,
    },
    {
      nome: 'TED / Transferência',
      modalidade: 'DINHEIRO_CONTA',
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

  console.log('🏬 Iniciando seed de Categorias de Lojas...');
  const defaultStoreCategories = [
    { nome: 'Supermercado', descricao: 'Alimentos, bebidas e itens essenciais do lar' },
    { nome: 'E-commerce', descricao: 'Lojas online e marketplaces' },
    { nome: 'Farmácia', descricao: 'Medicamentos, cosméticos e cuidados pessoais' },
    { nome: 'Restaurante & Alimentação', descricao: 'Bares, lanchonetes, padarias e restaurantes' },
    { nome: 'Eletrônicos & Informática', descricao: 'Computadores, periféricos e tecnologia' },
    { nome: 'Vestuário & Moda', descricao: 'Roupas, calçados e acessórios' },
    { nome: 'Serviços & Assinaturas', descricao: 'Streaming, internet, software e utilidades' },
    { nome: 'Outro', descricao: 'Outros tipos de estabelecimentos' },
  ];

  for (const sc of defaultStoreCategories) {
    const existing = await prisma.categoriaLoja.findFirst({
      where: { nome: sc.nome },
    });

    if (!existing) {
      await prisma.categoriaLoja.create({
        data: sc,
      });
      console.log(`✅ Categoria de Loja criada: ${sc.nome}`);
    } else {
      console.log(`ℹ️ Categoria de Loja já existente: ${sc.nome}`);
    }
  }

  console.log('🏷️ Iniciando seed de Categorias de Itens / Despesas...');
  const defaultItemCategories = [
    { nome: 'Alimentação', cor: '#ef4444' },
    { nome: 'Supermercado', cor: '#10b981' },
    { nome: 'Moradia', cor: '#6366f1' },
    { nome: 'Transporte', cor: '#f59e0b' },
    { nome: 'Tecnologia', cor: '#38b6ff' },
    { nome: 'Saúde', cor: '#ec4899' },
    { nome: 'Lazer', cor: '#8b5cf6' },
    { nome: 'Educação', cor: '#0ea5e9' },
    { nome: 'Vestuário', cor: '#14b8a6' },
    { nome: 'Outros', cor: '#64748b' },
  ];

  for (const ic of defaultItemCategories) {
    const existing = await prisma.categoriaItem.findFirst({
      where: { nome: ic.nome },
    });

    if (!existing) {
      await prisma.categoriaItem.create({
        data: ic,
      });
      console.log(`✅ Categoria de Item criada: ${ic.nome}`);
    } else {
      console.log(`ℹ️ Categoria de Item já existente: ${ic.nome}`);
    }
  }

  console.log('🏬 Iniciando seed de Lojas padrão...');
  const defaultStores = [
    { nome: 'Amazon', categoria: 'E-commerce' },
    { nome: 'Mercado Livre', categoria: 'E-commerce' },
    { nome: 'Carrefour', categoria: 'Supermercado' },
    { nome: 'Pão de Açúcar', categoria: 'Supermercado' },
    { nome: 'Drogasil', categoria: 'Farmácia' },
    { nome: 'Kabum', categoria: 'Eletrônicos & Informática' },
  ];

  for (const store of defaultStores) {
    const existing = await prisma.loja.findFirst({
      where: { nome: store.nome },
    });

    if (!existing) {
      await prisma.loja.create({
        data: store,
      });
      console.log(`✅ Loja criada: ${store.nome} (${store.categoria})`);
    } else {
      console.log(`ℹ️ Loja já existente: ${store.nome}`);
    }
  }

  console.log('👤 Iniciando seed de Compradores padrão...');
  const defaultBuyers = [
    { nome: 'Felipe', email: 'felipe@exemplo.com', ativo: true }
  ];

  for (const buyer of defaultBuyers) {
    const existing = await prisma.comprador.findFirst({
      where: { nome: buyer.nome },
    });

    if (!existing) {
      await prisma.comprador.create({
        data: buyer,
      });
      console.log(`✅ Comprador criado: ${buyer.nome}`);
    } else {
      console.log(`ℹ️ Comprador já existente: ${buyer.nome}`);
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
