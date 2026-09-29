import { PrismaClient } from '@prisma/client';

export async function seedCategoriasItens(prisma: PrismaClient) {
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
      console.log(`  ✅ Categoria de Item criada: ${ic.nome}`);
    } else {
      console.log(`  ℹ️ Categoria de Item já existente: ${ic.nome}`);
    }
  }
}
