import { PrismaClient } from '@prisma/client';

export async function seedUsuarios(prisma: PrismaClient) {
  console.log('👤 Iniciando seed de Compradores / Usuários padrão...');

  const defaultBuyers = [
    { nome: 'Felipe', email: 'felipe@exemplo.com', ativo: true },
  ];

  for (const buyer of defaultBuyers) {
    const existing = await prisma.comprador.findFirst({
      where: { nome: buyer.nome },
    });

    if (!existing) {
      await prisma.comprador.create({
        data: buyer,
      });
      console.log(`  ✅ Usuário/Comprador criado: ${buyer.nome}`);
    } else {
      console.log(`  ℹ️ Usuário/Comprador já existente: ${buyer.nome}`);
    }
  }
}
