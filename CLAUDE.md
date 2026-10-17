# Blue Fox Finance - Contexto de Engenharia & IA

Este documento serve como guia de contexto para assistentes de IA no repositório **Blue Fox Finance**. Para a especificação detalhada de cada pasta, módulo e entidade, consulte também [AGENTS.md](./AGENTS.md).

## 🌌 Visão Geral do Domínio
A **Blue Fox Finance** é o sistema central de controle financeiro do ecossistema Blue Fox.
- **Entidades principais:** Lançamentos/Despesas (`Lancamento`), Compradores (`Buyer`), Lojas (`Store`), Categorias (`CategoriaItem`, `CategoriaLoja`), Meios de Pagamento (`PaymentMethod`), Usuários (`Usuario`).
- **Autenticação & IAM:** SSO federado via Keycloak (Blue Fox IAM).

## 🏗️ Arquitetura do Frontend (Angular 19)

### Estrutura de Pastas (Core-Feature-Shared)
O frontend segue o padrão arquitetural modular unificado da Blue Fox:
- `src/app/core`: Singletons e lógica global (`AuthService`, interceptors, guards e serviços globais de API em `core/services/<nome>/`).
- `src/app/features`: Módulos de página e fluxos da aplicação em `features/pages/`:
  - `main/`: Rotas públicas (`home/`, `about/`, `updates/`).
  - `expenses/`: Fluxo de listagem (`expense-list/`) e criação (`expense-form/`).
  - `admin/`: Painel administrativo com categorias de itens/lojas e perfil de usuário.
  - `dashboard/`, `buyers/`, `stores/`, `payment-methods/`: Módulos de páginas de domínio.
- `src/app/shared`:
  - `components/general/`: Componentes reutilizáveis de layout (`navbar`, `sidebar`, `confirm-modal`, `notice-modal`, `searchable-dropdown`).
  - `model/types/`: Interfaces e tipos TypeScript de domínio.
  - `model/mocks/`: Dados de teste.

## 🏗️ Arquitetura do Backend (NestJS 10 + Prisma 5)

### Estrutura de Módulos (`backend/src/modules`)
- `auth`: Autenticação JWT via Keycloak, `JwtAuthGuard`, `RolesGuard`, decorators `@Roles()`, `@Public()`, `@CurrentUser()`. Roles em `roles.constants.ts` (espelho do realm). Todo controller de domínio leva `@Roles(...FINANCE_ACCESS_ROLES)` na classe (`ROLE_ADMIN`, `ROLE_FINANCE_ADMIN`, `ROLE_FINANCE_USER`); no frontend, as rotas internas usam `data: { roles: FINANCE_ACCESS_ROLES }`.
- `buyers`: Módulo de compradores (`buyers.controller.ts`, `buyers.service.ts`, `buyer.dto.ts`).
- `categories`: Categorias de itens e de lojas (`categories.controller.ts`, `categories.service.ts`).
- `dashboard`: Métricas consolidadas e faturas mensais (`dashboard.controller.ts`, `dashboard.service.ts`).
- `expenses`: Gestão de despesas, cálculo de parcelas e faturas de cartão (`expenses.controller.ts`, `expenses.service.ts`).
- `payment-methods`: Meios de pagamento (`payment-methods.controller.ts`, `payment-methods.service.ts`).
- `stores`: Gestão de lojas e fornecedores (`stores.controller.ts`, `stores.service.ts`).
- `prisma`: Módulo global com `PrismaService` conectado ao PostgreSQL.

### Modelagem Prisma (`backend/prisma`)
- Esquema modular em `prisma/schema/*.prisma` (`base.prisma`, `usuario.prisma`, `categoria.prisma`, `loja.prisma`, `pagamento.prisma`, `lancamento.prisma`).
- Seeds em `prisma/seeds/*.ts`.

## 🚀 Comandos Úteis
- **Frontend Build:** `cd frontend && npm run build`
- **Frontend Dev:** `cd frontend && npm run start`
- **Backend Dev:** `cd backend && npm run start:dev`
- **Docker Dev:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`
