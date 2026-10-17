-- CreateEnum
CREATE TYPE "ModalidadePagamento" AS ENUM ('CREDITO', 'DEBITO', 'DINHEIRO_CONTA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('A_VISTA', 'PARCELADO');

-- CreateTable
CREATE TABLE "categorias_itens" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_lojas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_lojas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compradores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "comprador" TEXT NOT NULL,
    "compradorId" TEXT,
    "nome" TEXT NOT NULL,
    "loja" TEXT NOT NULL,
    "lojaId" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL DEFAULT 1,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "meioPagamentoId" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL DEFAULT 'A_VISTA',
    "numeroParcelas" INTEGER NOT NULL DEFAULT 1,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lojas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lojas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" TEXT NOT NULL,
    "lancamentoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "totalParcelas" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "mesReferencia" TEXT NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "modalidade" "ModalidadePagamento" NOT NULL,
    "diaFechamento" INTEGER,
    "diaVencimento" INTEGER,
    "instituicaoBanco" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_itens_nome_key" ON "categorias_itens"("nome" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_lojas_nome_key" ON "categorias_lojas"("nome" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "compradores_nome_key" ON "compradores"("nome" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "lojas_nome_key" ON "lojas"("nome" ASC);

-- CreateIndex
CREATE INDEX "parcelas_mesReferencia_idx" ON "parcelas"("mesReferencia" ASC);

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "compradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_meioPagamentoId_fkey" FOREIGN KEY ("meioPagamentoId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_lancamentoId_fkey" FOREIGN KEY ("lancamentoId") REFERENCES "lancamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
