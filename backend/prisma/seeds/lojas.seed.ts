import { PrismaClient } from '@prisma/client';

export async function seedLojas(prisma: PrismaClient) {
  console.log('🏪 Iniciando seed de Lojas padrão...');

  const seedUserId = process.env.SEED_USER_ID || 'system-seed';

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
      where: {
        userId: seedUserId,
        nome: store.nome,
      },
    });

    if (!existing) {
      await prisma.loja.create({
        data: {
          ...store,
          userId: seedUserId,
        },
      });
      console.log(`  ✅ Loja criada: ${store.nome} (${store.categoria})`);
    } else {
      console.log(`  ℹ️ Loja já existente: ${store.nome}`);
    }
  }
}

