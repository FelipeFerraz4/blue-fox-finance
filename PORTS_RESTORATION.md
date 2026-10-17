# 🔄 Guia Rápido: Como Restaurar as Portas Padrão (8080 e 4200)

Este guia serve para retornar as portas do ecossistema **Blue Fox Finance** e **Blue Fox IAM** para os padrões originais caso os serviços de outros projetos (como o Ceará Valley) não estejam mais ocupando as portas `8080`, `5434` e `4200`.

---

## ⚡ 1. Restauração Automática (One-Liner)

Se você estiver na pasta raiz do repositório `blue-fox-finance/`, basta copiar e executar o bloco abaixo no terminal:

```bash
# 1. Restaura portas no IAM (KC_PORT=8080 e DB_PORT=5434)
sed -i 's/KC_PORT=8081/KC_PORT=8080/' ../blue-fox-iam/.env.dev
sed -i 's/DB_PORT=5436/DB_PORT=5434/' ../blue-fox-iam/.env.dev

# 2. Restaura porta no Frontend do Finance
sed -i 's/localhost:8081/localhost:8080/' frontend/src/environments/environment.ts

# 3. Restaura portas no .env.dev do Finance (FRONTEND_PORT=4200 e KEYCLOAK_ISSUER_URI)
sed -i 's/FRONTEND_PORT=4201/FRONTEND_PORT=4200/' .env.dev
sed -i 's/localhost:8081/localhost:8080/' .env.dev

# 4. Restaura porta no Backend do Finance (.env e jwt.strategy)
sed -i 's/localhost:8081/localhost:8080/' .env
sed -i 's/localhost:8081/localhost:8080/' backend/.env
sed -i 's/localhost:8081/localhost:8080/' backend/src/modules/auth/jwt.strategy.ts

# 5. Reinicia os containers do Keycloak com a nova porta 8080
docker rm -f blue-fox-iam-server blue-fox-iam-db
docker compose --project-directory ../blue-fox-iam \
  -f ../blue-fox-iam/docker-compose.yml \
  -f ../blue-fox-iam/docker-compose.dev.yml \
  --env-file ../blue-fox-iam/.env.dev up -d

```

---

## 🛠️ 2. Restauração Manual (Arquivo por Arquivo)

Caso prefira editar manualmente:

### A. Repositório `blue-fox-iam/`
Arquivo: `../blue-fox-iam/.env.dev`
```properties
DB_PORT=5434    # Altere de 5436 para 5434
KC_PORT=8080    # Altere de 8081 para 8080
```
Em seguida, recrie os containers:
```bash
docker rm -f blue-fox-iam-server blue-fox-iam-db
docker compose --project-directory ../blue-fox-iam -f ../blue-fox-iam/docker-compose.yml -f ../blue-fox-iam/docker-compose.dev.yml --env-file ../blue-fox-iam/.env.dev up -d
```

### B. Repositório `blue-fox-finance/`
1. **Frontend:** [frontend/src/environments/environment.ts](file:///home/felipe-ferraz/Downloads/git/blue-fox/blue-fox-finance/frontend/src/environments/environment.ts)
   ```typescript
   keycloak: {
     url: 'http://localhost:8080/auth', // Altere 8081 -> 8080
     realm: 'blue-fox-global-group',
     clientId: 'blue-fox-finance-web-local',
   }
   ```

2. **Backend:**
   - [.env](file:///home/felipe-ferraz/Downloads/git/blue-fox/blue-fox-finance/.env) e [backend/.env](file:///home/felipe-ferraz/Downloads/git/blue-fox/blue-fox-finance/backend/.env):
     ```properties
     KEYCLOAK_ISSUER_URI=http://localhost:8080/auth/realms/blue-fox-global-group
     ```
   - [jwt.strategy.ts](file:///home/felipe-ferraz/Downloads/git/blue-fox/blue-fox-finance/backend/src/modules/auth/jwt.strategy.ts):
     ```typescript
     const issuerUri = configService.get<string>(
       'KEYCLOAK_ISSUER_URI',
       'http://localhost:8080/auth/realms/blue-fox-global-group',
     );
     ```

---

## 🚀 3. Execução dos Serviços nas Portas Originais

- **Frontend (porta padrão 4200):**
  ```bash
  cd frontend
  npm run start
  # Aplicação abrirá em http://localhost:4200
  ```

- **Backend (porta 3000):**
  ```bash
  cd backend
  npm run start:dev
  # API abrirá em http://localhost:3000/api
  ```

- **Keycloak IAM (porta 8080):**
  - Console Admin: `http://localhost:8080/auth/admin`
