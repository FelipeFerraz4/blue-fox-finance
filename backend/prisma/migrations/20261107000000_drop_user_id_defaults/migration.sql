-- Remove o DEFAULT 'system-seed' usado só para preencher dados existentes na migration
-- add_user_isolation; o schema não declara default para userId.
ALTER TABLE "categorias_itens" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "categorias_lojas" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "compradores" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "lancamentos" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "lojas" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "payment_methods" ALTER COLUMN "userId" DROP DEFAULT;
