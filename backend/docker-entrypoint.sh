#!/bin/sh
# Inicialização do container do backend.
# Aplica só migrations versionadas (prisma migrate deploy); nunca usa db push --accept-data-loss.
set -e

# Transição única: bancos criados com "prisma db push" não têm a tabela _prisma_migrations.
# Nesse caso, sincroniza o schema SEM aceitar perda de dados (falha se a mudança for destrutiva)
# e marca todas as migrations existentes como aplicadas (baseline).
STATE=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$queryRawUnsafe(\"SELECT to_regclass('public._prisma_migrations') IS NULL AS nomig, EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public') AS hastables\")
  .then((r) => { console.log(r[0].nomig && r[0].hastables ? 'baseline' : 'ok'); return p.\$disconnect(); })
  .catch(() => { console.log('ok'); });
")

if [ "$STATE" = "baseline" ]; then
  echo "[entrypoint] Banco criado via db push detectado: fazendo baseline das migrations..."
  npx prisma db push --skip-generate
  for dir in prisma/migrations/*/; do
    npx prisma migrate resolve --applied "$(basename "$dir")"
  done
fi

npx prisma migrate deploy
exec node dist/src/main
