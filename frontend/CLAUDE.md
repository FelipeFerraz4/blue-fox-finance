# Blue Fox Finance - Frontend Architecture & AI Guidelines

Este documento serve como guia de arquitetura e convenções do frontend do **Blue Fox Finance**, alinhado ao padrão modular estabelecido no ecossistema Blue Fox (referência: `blue-fox-aquarismo`).

## 🏗️ Arquitetura do Frontend (Angular 19 / Core-Feature-Shared)

O projeto segue a arquitetura modular padrão da Blue Fox para escalabilidade e manutenção:

### 1. `src/app/core` (Singletons e Lógica Global)
- **Serviços Globais (`core/services/`):** Serviços de API e provedores compartilhados entre toda a aplicação (`admin-users/`, `auth/`, `bot/`, `buyers/`, `categories/`, `analytics/`, `expenses/`, `bills/`, `payment-methods/`, `sidebar/`, `stores/`, `user/`).
- **Guards (`core/guards/`):** Proteção de rotas com base em autenticação e papéis (`auth.guard.ts`).
- **Interceptors (`core/interceptors/`):** Interceptação HTTP global como injeção de tokens JWT (`auth.interceptor.ts`).
- **CoreModule (`core/core-module.ts`):** Módulo central de registro.

### 2. `src/app/features` (Páginas e Módulos de Domínio)
- **Páginas Principais (`features/pages/main/`):** Rotas públicas da aplicação (`home/`, `about/`, `updates/`).
- **Módulos de Domínio (`features/pages/`):**
  - `dashboard/`: Dashboard único estilo Power BI com filtro cruzado (`analytics.store.ts`), opções dos gráficos em `analytics-charts.ts` (paleta categórica validada para daltonismo, uma série = azul da marca) e `chart-card/` como moldura dos painéis. ECharts é registrado em `echarts.setup.ts` e fornecido só no componente (`provideEchartsCore`), mantendo-o fora do bundle inicial.
  - `expenses/`: Fluxo de listagem (`expense-list/`) e criação/edição (`expense-form/`).
  - `admin/`: Painel de administração (`admin.component.ts`), categorias de itens (`item-categories/`), categorias de lojas (`store-categories/`) e perfil de usuário (`user-profile/`, com `telegram-link-card/` para conectar o bot do Telegram via `BotService`) e `users/` (criação de usuários via `AdminUsersService`; rota e card só para `ROLE_FINANCE_ADMIN`: cards com `roles` são filtrados por `AuthService.hasRole`).
  - `buyers/`: Gestão de compradores/pagadores.
  - `stores/`: Gestão de lojas e fornecedores.
  - `payment-methods/`: Gestão de meios e modalidades de pagamento.
  - `bills/`: Contas a pagar (vencimentos do mês, marcar como paga, cadastro) e `bill-alerts-card/` (avisos no dashboard). O `BillsService` expõe o signal `alerts`, usado pelo selo da sidebar.

### 3. `src/app/shared` (Componentes Reutilizáveis e Tipos)
- **Componentes Gerais (`shared/components/general/`):** Componentes comuns de layout e UI (`navbar/`, `sidebar/`, `confirm-modal/`, `notice-modal/`).
- **Modelos e Tipos (`shared/model/types/`):** Interfaces e tipos TypeScript de todas as entidades do domínio financeiro (`admin-user.model.ts`, `analytics.model.ts`, `bill.model.ts`, `bot.model.ts`, `buyer.model.ts`, `category.model.ts`, `lancamento.model.ts`, `payment-method.model.ts`, `store.model.ts`).
- **Mocks (`shared/model/mocks/`):** Mocks e dados estáticos de teste.

## 📅 Datas
- A data da compra (`Lancamento.data`) é gravada como meia-noite UTC (`YYYY-MM-DD` enviado pelo formulário). Exiba sempre em UTC (`date:'dd/MM/yyyy':'UTC'`), senão no Brasil (UTC−3) aparece o dia anterior. Para "hoje", use a data local (`toLocaleDateString('en-CA')`), nunca `toISOString()`.

## 🚀 Comandos Úteis
- **Build de Produção:** `npm run build`
- **Execução Local:** `npm run start` (ou via Docker: `docker compose -f docker-compose.dev.yml up frontend`)
