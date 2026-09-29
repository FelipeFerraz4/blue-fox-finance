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

COPY package*.json tsconfig*.json ./
RUN npm install --omit=dev && npm install -g ts-node typescript@^5.6.2 prisma

ENV NODE_PATH=/usr/local/lib/node_modules

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && node dist/src/main"]
