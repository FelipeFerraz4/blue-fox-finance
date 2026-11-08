-- CreateEnum
CREATE TYPE "RecorrenciaConta" AS ENUM ('MENSAL', 'ANUAL', 'UNICA');

-- CreateTable
CREATE TABLE "contas_pagar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "recorrencia" "RecorrenciaConta" NOT NULL DEFAULT 'MENSAL',
    "diaVencimento" INTEGER,
    "mesVencimento" INTEGER,
    "dataUnica" TIMESTAMP(3),
    "valorPrevisto" DECIMAL(12,2),
    "meioPagamentoId" TEXT,
    "lembrarDiasAntes" INTEGER NOT NULL DEFAULT 2,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_pagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_conta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "mesReferencia" TEXT NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorPrevisto" DECIMAL(12,2),
    "valorPago" DECIMAL(12,2),
    "pagoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_conta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contas_pagar_userId_idx" ON "contas_pagar"("userId");

-- CreateIndex
CREATE INDEX "pagamentos_conta_userId_dataVencimento_idx" ON "pagamentos_conta"("userId", "dataVencimento");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_conta_contaId_mesReferencia_key" ON "pagamentos_conta"("contaId", "mesReferencia");

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_meioPagamentoId_fkey" FOREIGN KEY ("meioPagamentoId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_conta" ADD CONSTRAINT "pagamentos_conta_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas_pagar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
