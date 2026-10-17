-- DropIndex
DROP INDEX IF EXISTS "categorias_itens_nome_key";
DROP INDEX IF EXISTS "categorias_lojas_nome_key";
DROP INDEX IF EXISTS "compradores_nome_key";
DROP INDEX IF EXISTS "lojas_nome_key";

-- AlterTable (adicionando coluna userId com default para dados existentes)
ALTER TABLE "categorias_itens" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'system-seed';
ALTER TABLE "categorias_lojas" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'system-seed';
ALTER TABLE "compradores" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'system-seed';
ALTER TABLE "lancamentos" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'system-seed';
ALTER TABLE "lojas" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'system-seed';
ALTER TABLE "payment_methods" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'system-seed';

-- CreateIndex
CREATE INDEX "categorias_itens_userId_idx" ON "categorias_itens"("userId");
CREATE UNIQUE INDEX "categorias_itens_userId_nome_key" ON "categorias_itens"("userId", "nome");

CREATE INDEX "categorias_lojas_userId_idx" ON "categorias_lojas"("userId");
CREATE UNIQUE INDEX "categorias_lojas_userId_nome_key" ON "categorias_lojas"("userId", "nome");

CREATE INDEX "compradores_userId_idx" ON "compradores"("userId");
CREATE UNIQUE INDEX "compradores_userId_nome_key" ON "compradores"("userId", "nome");

CREATE INDEX "lancamentos_userId_idx" ON "lancamentos"("userId");

CREATE INDEX "lojas_userId_idx" ON "lojas"("userId");
CREATE UNIQUE INDEX "lojas_userId_nome_key" ON "lojas"("userId", "nome");

CREATE INDEX "payment_methods_userId_idx" ON "payment_methods"("userId");
