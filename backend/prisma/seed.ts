import { PrismaClient } from '@prisma/client';
import { seedPagamentos } from './seeds/pagamentos.seed';
import { seedCategoriasLojas } from './seeds/categorias-lojas.seed';
import { seedCategoriasItens } from './seeds/categorias-itens.seed';
import { seedLojas } from './seeds/lojas.seed';
import { seedUsuarios } from './seeds/usuarios.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando processo de seed modular do BlueFox Spend...');
  const startTime = Date.now();

  try {
    // 1. Meios de pagamento
    await seedPagamentos(prisma);

    // 2. Categorias de Lojas
    await seedCategoriasLojas(prisma);

    // 3. Categorias de Itens/Despesas
    await seedCategoriasItens(prisma);

    // 4. Lojas padrão
    await seedLojas(prisma);

    // 5. Usuários/Compradores padrão
    await seedUsuarios(prisma);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✨ Todos os seeds foram aplicados com sucesso em ${elapsed}s!`);
  } catch (error) {
    console.error('❌ Erro durante a execução dos seeds:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
