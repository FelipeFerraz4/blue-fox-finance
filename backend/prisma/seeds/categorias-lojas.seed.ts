import { PrismaClient } from '@prisma/client';

export async function seedCategoriasLojas(prisma: PrismaClient) {
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
      console.log(`  ✅ Categoria de Loja criada: ${sc.nome}`);
    } else {
      console.log(`  ℹ️ Categoria de Loja já existente: ${sc.nome}`);
    }
  }
}
