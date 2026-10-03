FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependências
COPY package*.json ./
RUN npm install

# Copiar código e compilar Angular
COPY angular.json tsconfig*.json ./
COPY src ./src/
COPY public ./public/

RUN npm run build

# Preparar pasta única independente da versão do Angular builder
RUN mkdir -p /app/public-html && \
    if [ -d "/app/dist/bluefox-finance-frontend/browser" ]; then \
      cp -r /app/dist/bluefox-finance-frontend/browser/* /app/public-html/; \
    else \
      cp -r /app/dist/bluefox-finance-frontend/* /app/public-html/; \
    fi

# Stage 2: Nginx para servir a SPA
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Suporte caso o build context seja a raiz ou a pasta frontend
COPY --from=builder /app/public-html /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
