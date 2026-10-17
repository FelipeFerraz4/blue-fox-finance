-- CreateTable
CREATE TABLE "preferencias_lancamento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "compradorPadraoId" TEXT,
    "lojaPadraoId" TEXT,
    "meioPagamentoPadraoId" TEXT,
    "categoriaPadrao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencias_lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_lancamento_userId_key" ON "preferencias_lancamento"("userId");

-- CreateIndex
CREATE INDEX "preferencias_lancamento_userId_idx" ON "preferencias_lancamento"("userId");

-- AddForeignKey
ALTER TABLE "preferencias_lancamento" ADD CONSTRAINT "preferencias_lancamento_compradorPadraoId_fkey" FOREIGN KEY ("compradorPadraoId") REFERENCES "compradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferencias_lancamento" ADD CONSTRAINT "preferencias_lancamento_lojaPadraoId_fkey" FOREIGN KEY ("lojaPadraoId") REFERENCES "lojas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferencias_lancamento" ADD CONSTRAINT "preferencias_lancamento_meioPagamentoPadraoId_fkey" FOREIGN KEY ("meioPagamentoPadraoId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
