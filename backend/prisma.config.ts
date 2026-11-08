// Configuração da CLI do Prisma (Prisma 6+). Com este arquivo o .env não é carregado
// automaticamente, por isso o import do dotenv (em container as variáveis vêm do compose).
import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Schema dividido em vários arquivos dentro de prisma/schema
  schema: path.join('prisma', 'schema'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
});
