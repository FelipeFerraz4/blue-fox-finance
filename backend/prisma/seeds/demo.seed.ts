/**
 * Seed de DEMONSTRAÇÃO (só desenvolvimento): gera ~2 anos de dados realistas para um
 * usuário, para conferir o dashboard, os lançamentos e as contas a pagar.
 *
 * Nunca roda sozinho (não está no docker-entrypoint). Uso:
 *   SEED_USER_ID=<sub do Keycloak> npm run seed:demo
 *   SEED_USER_ID=<sub> SEED_RESET=true npm run seed:demo   # apaga os dados desse usuário antes
 *
 * O `sub` é o ID do usuário no Keycloak (Users → usuário → ID), o mesmo `userId` do backend.
 */
import 'dotenv/config';
import { ModalidadePagamento, Prisma, PrismaClient, RecorrenciaConta, TipoLancamento } from '@prisma/client';
import { InvoiceCalculatorHelper } from '../../src/common/helpers/invoice-calculator.helper';
import { BillScheduleHelper } from '../../src/common/helpers/bill-schedule.helper';

const prisma = new PrismaClient();
const userId = process.env.SEED_USER_ID?.trim();
const reset = process.env.SEED_RESET === 'true';

// PRNG determinístico: a mesma execução gera sempre os mesmos dados
let state = 20261109;
const rnd = () => {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
};
const pick = <T>(list: T[]): T => list[Math.floor(rnd() * list.length)];
const between = (min: number, max: number) => Number((min + rnd() * (max - min)).toFixed(2));
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const ITEM_CATEGORIES = [
  ['Alimentação', '#10b981'], ['Moradia', '#004aad'], ['Transporte', '#f59e0b'], ['Lazer', '#e87ba4'],
  ['Saúde', '#ef4444'], ['Eletrônicos', '#6250d6'], ['Vestuário', '#eb6834'], ['Educação', '#38b6ff'],
  ['Pets', '#1baf7a'], ['Assinaturas', '#64748b'], ['Casa', '#0b132b'],
] as const;

const STORE_CATEGORIES = ['Supermercado', 'E-commerce', 'Farmácia', 'Posto', 'Restaurante', 'Serviços', 'Vestuário', 'Pet shop', 'Eletrônicos', 'Casa'];

const STORES: Array<[string, string]> = [
  ['Carrefour', 'Supermercado'], ['Pão de Açúcar', 'Supermercado'], ['Atacadão', 'Supermercado'],
  ['Amazon', 'E-commerce'], ['Mercado Livre', 'E-commerce'], ['Drogasil', 'Farmácia'], ['Droga Raia', 'Farmácia'],
  ['Shell', 'Posto'], ['Ipiranga', 'Posto'], ['iFood', 'Restaurante'], ['Outback', 'Restaurante'],
  ['Netflix', 'Serviços'], ['Spotify', 'Serviços'], ['Uber', 'Serviços'], ['Renner', 'Vestuário'],
  ['Petz', 'Pet shop'], ['Kabum', 'Eletrônicos'], ['Magazine Luiza', 'Eletrônicos'], ['Leroy Merlin', 'Casa'],
  ['Udemy', 'Serviços'],
];

interface ExpenseInput {
  data: string;
  nome: string;
  loja: string;
  categoria: string;
  valor: number;
  meio: string;
  comprador: string;
  parcelas?: number;
}

async function main() {
  if (!userId) {
    throw new Error('Informe SEED_USER_ID com o sub do usuário no Keycloak.');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed de demonstração não roda com NODE_ENV=production.');
  }

  const existing = await prisma.lancamento.count({ where: { userId } });
  if (existing > 0 && !reset) {
    throw new Error(`O usuário já tem ${existing} lançamento(s). Use SEED_RESET=true para apagar e recriar.`);
  }
  if (reset) await wipe(userId);

  console.log(`🌱 Criando dados de demonstração para ${userId}...`);

  // ---- Cadastros base -------------------------------------------------------
  await prisma.categoriaItem.createMany({
    data: ITEM_CATEGORIES.map(([nome, cor]) => ({ userId, nome, cor })),
  });
  await prisma.categoriaLoja.createMany({ data: STORE_CATEGORIES.map((nome) => ({ userId, nome })) });

  const lojas = new Map<string, string>();
  for (const [nome, categoria] of STORES) {
    const loja = await prisma.loja.create({ data: { userId, nome, categoria } });
    lojas.set(nome, loja.id);
  }

  const compradores = new Map<string, string>();
  for (const [nome, email] of [['Felipe', 'felipe@bluefox.com'], ['Ana', null], ['Família', null]] as const) {
    const c = await prisma.comprador.create({ data: { userId, nome, email } });
    compradores.set(nome, c.id);
  }

  const meios = new Map<string, Awaited<ReturnType<typeof prisma.paymentMethod.create>>>();
  const methodDefs: Array<Prisma.PaymentMethodCreateManyInput> = [
    { userId, nome: 'Nubank', modalidade: ModalidadePagamento.CREDITO, instituicaoBanco: 'Nubank', diaFechamento: 28, diaVencimento: 5 },
    { userId, nome: 'Itaú Platinum', modalidade: ModalidadePagamento.CREDITO, instituicaoBanco: 'Itaú', diaFechamento: 20, diaVencimento: 27 },
    { userId, nome: 'Pix', modalidade: ModalidadePagamento.DINHEIRO_CONTA, instituicaoBanco: 'Inter' },
    { userId, nome: 'Débito Inter', modalidade: ModalidadePagamento.DEBITO, instituicaoBanco: 'Inter' },
    { userId, nome: 'Dinheiro', modalidade: ModalidadePagamento.DINHEIRO_CONTA, instituicaoBanco: 'Carteira' },
  ];
  for (const def of methodDefs) {
    meios.set(def.nome, await prisma.paymentMethod.create({ data: def }));
  }

  // ---- Lançamentos (jan/2025 até hoje) -------------------------------------
  const today = new Date(`${BillScheduleHelper.today()}T12:00:00`);
  const expenses: ExpenseInput[] = [];
  const add = (e: ExpenseInput) => {
    if (new Date(`${e.data}T12:00:00`) <= today) expenses.push(e);
  };

  for (let d = new Date(2025, 0, 1, 12); d <= today; d.setDate(d.getDate() + 1)) {
    const day = d.getDate();
    const weekday = d.getDay();
    const month = d.getMonth();
    const date = iso(d);
    const dezembro = month === 11 ? 1.35 : 1; // fim de ano gasta mais

    // Mercado toda semana (sábado)
    if (weekday === 6) {
      add({ data: date, nome: 'Compra do mês', loja: pick(['Carrefour', 'Pão de Açúcar', 'Atacadão']), categoria: 'Alimentação', valor: between(180, 520) * dezembro, meio: pick(['Nubank', 'Débito Inter', 'Pix']), comprador: pick(['Felipe', 'Ana', 'Família']) });
    }
    // Combustível duas vezes por mês
    if (day === 3 || day === 18) {
      add({ data: date, nome: 'Gasolina', loja: pick(['Shell', 'Ipiranga']), categoria: 'Transporte', valor: between(180, 290), meio: 'Itaú Platinum', comprador: 'Felipe' });
    }
    // Delivery algumas vezes por semana
    if ((weekday === 5 || weekday === 0) && rnd() < 0.7) {
      add({ data: date, nome: pick(['Pizza', 'Hambúrguer', 'Japonês', 'Almoço']), loja: 'iFood', categoria: 'Alimentação', valor: between(45, 140) * dezembro, meio: 'Nubank', comprador: pick(['Felipe', 'Ana']) });
    }
    // Uber
    if (rnd() < 0.12) {
      add({ data: date, nome: 'Corrida', loja: 'Uber', categoria: 'Transporte', valor: between(14, 58), meio: 'Nubank', comprador: pick(['Felipe', 'Ana']) });
    }
    // Assinaturas mensais
    if (day === 8) add({ data: date, nome: 'Netflix', loja: 'Netflix', categoria: 'Assinaturas', valor: 44.9, meio: 'Nubank', comprador: 'Família' });
    if (day === 12) add({ data: date, nome: 'Spotify Família', loja: 'Spotify', categoria: 'Assinaturas', valor: 34.9, meio: 'Nubank', comprador: 'Família' });
    // Farmácia
    if (day === 21 || (rnd() < 0.04)) {
      add({ data: date, nome: pick(['Remédios', 'Vitaminas', 'Higiene']), loja: pick(['Drogasil', 'Droga Raia']), categoria: 'Saúde', valor: between(35, 210), meio: pick(['Pix', 'Débito Inter']), comprador: pick(['Felipe', 'Ana']) });
    }
    // Pet
    if (day === 15) add({ data: date, nome: 'Ração e areia', loja: 'Petz', categoria: 'Pets', valor: between(160, 260), meio: 'Itaú Platinum', comprador: 'Ana' });
    // Lazer
    if (weekday === 6 && rnd() < 0.3) {
      add({ data: date, nome: 'Jantar fora', loja: 'Outback', categoria: 'Lazer', valor: between(180, 420) * dezembro, meio: 'Itaú Platinum', comprador: 'Família' });
    }
    // Roupas
    if (rnd() < 0.035 * dezembro) {
      add({ data: date, nome: pick(['Camisa', 'Calça', 'Tênis', 'Vestido']), loja: 'Renner', categoria: 'Vestuário', valor: between(90, 380), meio: 'Nubank', comprador: pick(['Felipe', 'Ana']) });
    }
    // Compras online pequenas
    if (rnd() < 0.05) {
      add({ data: date, nome: pick(['Fone Bluetooth', 'Livro', 'Organizador', 'Cabo USB-C', 'Luminária']), loja: pick(['Amazon', 'Mercado Livre']), categoria: pick(['Eletrônicos', 'Casa', 'Educação']), valor: between(40, 260), meio: 'Nubank', comprador: pick(['Felipe', 'Ana']) });
    }
  }

  // Compras parceladas grandes
  const big: ExpenseInput[] = [
    { data: '2025-03-14', nome: 'Smart TV 55"', loja: 'Magazine Luiza', categoria: 'Eletrônicos', valor: 3299, meio: 'Nubank', comprador: 'Família', parcelas: 10 },
    { data: '2025-07-02', nome: 'Curso de Inglês', loja: 'Udemy', categoria: 'Educação', valor: 1200, meio: 'Itaú Platinum', comprador: 'Felipe', parcelas: 6 },
    { data: '2025-11-28', nome: 'Black Friday - Notebook', loja: 'Kabum', categoria: 'Eletrônicos', valor: 5400, meio: 'Nubank', comprador: 'Felipe', parcelas: 12 },
    { data: '2026-02-09', nome: 'Geladeira Frost Free', loja: 'Magazine Luiza', categoria: 'Casa', valor: 4290, meio: 'Itaú Platinum', comprador: 'Família', parcelas: 10 },
    { data: '2026-05-20', nome: 'Sofá retrátil', loja: 'Leroy Merlin', categoria: 'Casa', valor: 2799, meio: 'Nubank', comprador: 'Família', parcelas: 6 },
    { data: '2026-08-11', nome: 'Celular novo', loja: 'Amazon', categoria: 'Eletrônicos', valor: 3999, meio: 'Itaú Platinum', comprador: 'Ana', parcelas: 12 },
    { data: '2026-10-25', nome: 'Viagem de fim de ano', loja: 'Mercado Livre', categoria: 'Lazer', valor: 3600, meio: 'Nubank', comprador: 'Família', parcelas: 5 },
  ];
  big.forEach(add);

  for (const e of expenses) await createExpense(e, meios, lojas, compradores);
  console.log(`  ✅ ${expenses.length} lançamentos`);

  // ---- Contas a pagar -------------------------------------------------------
  const nubank = meios.get('Nubank')!;
  const itau = meios.get('Itaú Platinum')!;
  const start2026 = new Date(2026, 0, 1, 12);

  const bills = {
    aluguel: await prisma.contaPagar.create({ data: { userId, nome: 'Aluguel', categoria: 'Moradia', recorrencia: RecorrenciaConta.MENSAL, diaVencimento: 10, valorPrevisto: 1850, dataInicio: start2026 } }),
    energia: await prisma.contaPagar.create({ data: { userId, nome: 'Energia', categoria: 'Moradia', recorrencia: RecorrenciaConta.MENSAL, diaVencimento: 12, dataInicio: start2026, observacoes: 'Valor varia todo mês' } }),
    internet: await prisma.contaPagar.create({ data: { userId, nome: 'Internet', categoria: 'Moradia', recorrencia: RecorrenciaConta.MENSAL, diaVencimento: 15, valorPrevisto: 119.9, dataInicio: start2026 } }),
    academia: await prisma.contaPagar.create({ data: { userId, nome: 'Academia', categoria: 'Saúde', recorrencia: RecorrenciaConta.MENSAL, diaVencimento: 11, valorPrevisto: 99.9, dataInicio: start2026 } }),
    faturaNubank: await prisma.contaPagar.create({ data: { userId, nome: 'Fatura Nubank', categoria: 'Cartão', recorrencia: RecorrenciaConta.MENSAL, diaVencimento: 5, meioPagamentoId: nubank.id, dataInicio: start2026 } }),
    faturaItau: await prisma.contaPagar.create({ data: { userId, nome: 'Fatura Itaú', categoria: 'Cartão', recorrencia: RecorrenciaConta.MENSAL, diaVencimento: 27, meioPagamentoId: itau.id, dataInicio: start2026 } }),
    seguro: await prisma.contaPagar.create({ data: { userId, nome: 'Seguro do carro', categoria: 'Transporte', recorrencia: RecorrenciaConta.ANUAL, diaVencimento: 20, mesVencimento: 3, valorPrevisto: 2380, dataInicio: start2026 } }),
    ipva: await prisma.contaPagar.create({ data: { userId, nome: 'IPVA 2026', categoria: 'Transporte', recorrencia: RecorrenciaConta.UNICA, dataUnica: new Date('2026-02-10'), valorPrevisto: 1460, dataInicio: new Date(2026, 1, 1, 12) } }),
  };

  // Pagamentos: tudo pago até outubro, exceto a Energia de outubro (fica atrasada).
  // Em novembro só a fatura do Nubank (venceu dia 5) foi paga; o resto segue pendente.
  const currentMonth = BillScheduleHelper.currentMonth();
  const months = BillScheduleHelper.monthRange('2026-01', currentMonth);
  let pagas = 0;
  for (const bill of Object.values(bills)) {
    for (const month of months) {
      const due = BillScheduleHelper.dueDateFor(bill, month);
      if (!due || due > today) continue;
      if (bill.id === bills.energia.id && month === '2026-10') continue;
      if (month === currentMonth && bill.id !== bills.faturaNubank.id) continue;

      let valorPago: number;
      if (bill.meioPagamentoId) {
        const agg = await prisma.parcela.aggregate({
          _sum: { valor: true },
          where: { mesReferencia: month, lancamento: { userId, meioPagamentoId: bill.meioPagamentoId } },
        });
        valorPago = Number(agg._sum.valor ?? 0);
        await prisma.parcela.updateMany({
          where: { mesReferencia: month, lancamento: { userId, meioPagamentoId: bill.meioPagamentoId } },
          data: { pago: true },
        });
      } else if (bill.id === bills.energia.id) {
        valorPago = between(165, 340);
      } else {
        valorPago = Number(bill.valorPrevisto);
      }

      const pagoEm = new Date(due);
      pagoEm.setDate(pagoEm.getDate() - Math.floor(rnd() * 3));
      await prisma.pagamentoConta.create({
        data: { userId, contaId: bill.id, mesReferencia: month, dataVencimento: due, valorPrevisto: bill.valorPrevisto, valorPago, pagoEm },
      });
      pagas++;
    }
  }
  console.log(`  ✅ ${Object.keys(bills).length} contas a pagar (${pagas} pagamentos registrados)`);

  // ---- Preferências --------------------------------------------------------
  await prisma.preferenciaLancamento.create({
    data: { userId, compradorPadraoId: compradores.get('Felipe'), meioPagamentoPadraoId: nubank.id, categoriaPadrao: 'Alimentação' },
  });

  console.log('✨ Pronto! Entre com esse usuário e abra o Dashboard.');
}

async function createExpense(
  e: ExpenseInput,
  meios: Map<string, { id: string; modalidade: ModalidadePagamento; diaFechamento: number | null; diaVencimento: number | null }>,
  lojas: Map<string, string>,
  compradores: Map<string, string>,
) {
  const meio = meios.get(e.meio)!;
  const numeroParcelas = e.parcelas ?? 1;
  const valorTotal = Number(e.valor.toFixed(2));
  // Mesmo cálculo do ExpensesService: data como meia-noite UTC e regras de fatura do cartão
  const dataCompra = new Date(e.data);
  const parcelas = InvoiceCalculatorHelper.calculateInstallments({
    dataCompra,
    valorTotal,
    numeroParcelas,
    modalidade: meio.modalidade,
    diaFechamento: meio.diaFechamento,
    diaVencimento: meio.diaVencimento,
  });

  await prisma.lancamento.create({
    data: {
      userId,
      comprador: e.comprador,
      compradorId: compradores.get(e.comprador) ?? null,
      nome: e.nome,
      loja: e.loja,
      lojaId: lojas.get(e.loja) ?? null,
      data: dataCompra,
      categoria: e.categoria,
      quantidade: 1,
      valorUnitario: valorTotal,
      valorTotal,
      meioPagamentoId: meio.id,
      tipo: numeroParcelas > 1 ? TipoLancamento.PARCELADO : TipoLancamento.A_VISTA,
      numeroParcelas,
      parcelas: { create: parcelas },
    },
  });
}

/** Apaga todos os dados do usuário, na ordem das chaves estrangeiras. */
async function wipe(uid: string) {
  console.log(`🧹 Apagando dados existentes de ${uid}...`);
  await prisma.$transaction([
    prisma.pagamentoConta.deleteMany({ where: { userId: uid } }),
    prisma.contaPagar.deleteMany({ where: { userId: uid } }),
    prisma.preferenciaLancamento.deleteMany({ where: { userId: uid } }),
    prisma.lancamento.deleteMany({ where: { userId: uid } }), // parcelas em cascata
    prisma.paymentMethod.deleteMany({ where: { userId: uid } }),
    prisma.loja.deleteMany({ where: { userId: uid } }),
    prisma.comprador.deleteMany({ where: { userId: uid } }),
    prisma.categoriaItem.deleteMany({ where: { userId: uid } }),
    prisma.categoriaLoja.deleteMany({ where: { userId: uid } }),
  ]);
}

main()
  .catch((e) => {
    console.error(`❌ ${e.message ?? e}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
