-- CreateTable
CREATE TABLE "preferencias_usuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idioma" TEXT NOT NULL DEFAULT 'pt',
    "regiao" TEXT NOT NULL DEFAULT 'BR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencias_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_usuario_userId_key" ON "preferencias_usuario"("userId");
