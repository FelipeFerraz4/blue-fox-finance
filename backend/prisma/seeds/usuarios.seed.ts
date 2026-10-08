import { PrismaClient } from '@prisma/client';

export async function seedUsuarios(prisma: PrismaClient) {
  console.log('👤 Iniciando seed de Compradores / Usuários padrão...');

  const defaultBuyers = [
    {
      nome: 'Admin Finance',
      email: 'adminfinance@bluefoxglobalgroup.com',
      ativo: true,
    },
    {
      nome: 'Usuário Finance',
      email: 'felipe@bluefoxglobalgroup.com',
      ativo: true,
    },
  ];

  for (const buyer of defaultBuyers) {
    const existing = await prisma.comprador.findFirst({
      where: {
        OR: [{ nome: buyer.nome }, { email: buyer.email }],
      },
    });

    if (!existing) {
      await prisma.comprador.create({
        data: buyer,
      });
      console.log(`  ✅ Usuário/Comprador criado: ${buyer.nome} (${buyer.email})`);
    } else {
      console.log(`  ℹ️ Usuário/Comprador já existente: ${buyer.nome}`);
    }
  }
}
