import { PrismaClient } from '@prisma/client';

export async function seedLojas(prisma: PrismaClient) {
  console.log('🏪 Iniciando seed de Lojas padrão...');

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
      console.log(`  ✅ Loja criada: ${store.nome} (${store.categoria})`);
    } else {
      console.log(`  ℹ️ Loja já existente: ${store.nome}`);
    }
  }
}
