-- CreateEnum
CREATE TYPE "CanalBot" AS ENUM ('TELEGRAM');

-- CreateEnum
CREATE TYPE "OrigemLancamento" AS ENUM ('WEB', 'TELEGRAM');

-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "origem" "OrigemLancamento" NOT NULL DEFAULT 'WEB';

-- CreateTable
CREATE TABLE "bot_vinculos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canal" "CanalBot" NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_vinculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_codigos_vinculo" (
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_codigos_vinculo_pkey" PRIMARY KEY ("codeHash")
);

-- CreateTable
CREATE TABLE "bot_conversas" (
    "canal" "CanalBot" NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "estado" JSONB NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_conversas_pkey" PRIMARY KEY ("canal","externalUserId")
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_vinculos_userId_key" ON "bot_vinculos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bot_vinculos_canal_externalUserId_key" ON "bot_vinculos"("canal", "externalUserId");

-- CreateIndex
CREATE INDEX "bot_codigos_vinculo_userId_idx" ON "bot_codigos_vinculo"("userId");

