FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Instalar dependências
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma/
RUN npm install

# Copiar código-fonte e compilar
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

COPY package*.json prisma.config.ts ./
# A CLI do Prisma é dependência de produção (migrate deploy na inicialização), na versão do lockfile
RUN npm install --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 3000

# Migrations versionadas + baseline automático de bancos criados via db push (ver docker-entrypoint.sh)
CMD ["sh", "./docker-entrypoint.sh"]
