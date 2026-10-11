# Blue Fox Finance - Frontend Architecture & AI Guidelines

Este documento serve como guia de arquitetura e convenções do frontend do **Blue Fox Finance**, alinhado ao padrão modular estabelecido no ecossistema Blue Fox (referência: `blue-fox-aquarismo`).

## 🏗️ Arquitetura do Frontend (Angular 19 / Core-Feature-Shared)

O projeto segue a arquitetura modular padrão da Blue Fox para escalabilidade e manutenção:

### 1. `src/app/core` (Singletons e Lógica Global)
- **Serviços Globais (`core/services/`):** Serviços de API e provedores compartilhados entre toda a aplicação (`auth/`, `buyers/`, `categories/`, `dashboard/`, `expenses/`, `payment-methods/`, `sidebar/`, `stores/`, `user/`).
- **Guards (`core/guards/`):** Proteção de rotas com base em autenticação e papéis (`auth.guard.ts`).
- **Interceptors (`core/interceptors/`):** Interceptação HTTP global como injeção de tokens JWT (`auth.interceptor.ts`).
- **CoreModule (`core/core-module.ts`):** Módulo central de registro.

### 2. `src/app/features` (Páginas e Módulos de Domínio)
- **Páginas Principais (`features/pages/main/`):** Rotas públicas da aplicação (`home/`, `about/`, `updates/`).
- **Módulos de Domínio (`features/pages/`):**
  - `dashboard/`: Visão geral e métricas financeiras.
  - `expenses/`: Fluxo de listagem (`expense-list/`) e criação/edição (`expense-form/`).
  - `admin/`: Painel de administração (`admin.component.ts`), categorias de itens (`item-categories/`), categorias de lojas (`store-categories/`) e perfil de usuário (`user-profile/`).
  - `buyers/`: Gestão de compradores/pagadores.
  - `stores/`: Gestão de lojas e fornecedores.
  - `payment-methods/`: Gestão de meios e modalidades de pagamento.

### 3. `src/app/shared` (Componentes Reutilizáveis e Tipos)
- **Componentes Gerais (`shared/components/general/`):** Componentes comuns de layout e UI (`navbar/`, `sidebar/`, `confirm-modal/`, `notice-modal/`).
- **Modelos e Tipos (`shared/model/types/`):** Interfaces e tipos TypeScript de todas as entidades do domínio financeiro (`buyer.model.ts`, `category.model.ts`, `dashboard.model.ts`, `lancamento.model.ts`, `payment-method.model.ts`, `store.model.ts`).
- **Mocks (`shared/model/mocks/`):** Mocks e dados estáticos de teste.

## 🚀 Comandos Úteis
- **Build de Produção:** `npm run build`
- **Execução Local:** `npm run start` (ou via Docker: `docker compose -f docker-compose.dev.yml up frontend`)
