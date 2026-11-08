FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Instalar dependências
COPY package*.json ./
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

COPY package*.json ./
# CLI do Prisma na mesma versão do lockfile (a do client), para migrate deploy na inicialização
RUN npm install --omit=dev && \
    npm install -g prisma@$(node -p "require('./package-lock.json').packages['node_modules/prisma'].version")

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 3000

# Migrations versionadas + baseline automático de bancos criados via db push (ver docker-entrypoint.sh)
CMD ["sh", "./docker-entrypoint.sh"]
