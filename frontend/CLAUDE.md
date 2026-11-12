# Blue Fox Finance - Frontend Architecture & AI Guidelines

Este documento serve como guia de arquitetura e convenções do frontend do **Blue Fox Finance**, alinhado ao padrão modular estabelecido no ecossistema Blue Fox (referência: `blue-fox-aquarismo`).

## 🏗️ Arquitetura do Frontend (Angular 19 / Core-Feature-Shared)

O projeto segue a arquitetura modular padrão da Blue Fox para escalabilidade e manutenção:

### 1. `src/app/core` (Singletons e Lógica Global)
- **Serviços Globais (`core/services/`):** Serviços de API e provedores compartilhados entre toda a aplicação (`accessibility/`, `admin-users/`, `auth/`, `bot/`, `buyers/`, `categories/`, `analytics/`, `expenses/`, `bills/`, `payment-methods/`, `sidebar/`, `stores/`, `theme/`, `user/`).
- **Guards (`core/guards/`):** Proteção de rotas com base em autenticação e papéis (`auth.guard.ts`).
- **Interceptors (`core/interceptors/`):** Interceptação HTTP global como injeção de tokens JWT (`auth.interceptor.ts`).
- **CoreModule (`core/core-module.ts`):** Módulo central de registro.

### 2. `src/app/features` (Páginas e Módulos de Domínio)
- **Páginas Principais (`features/pages/main/`):** Rotas públicas da aplicação (`home/`, `about/`, `updates/`).
- **Módulos de Domínio (`features/pages/`):**
  - `dashboard/`: Dashboard único estilo Power BI com filtro cruzado (`analytics.store.ts`), opções dos gráficos em `analytics-charts.ts` (paleta categórica validada para daltonismo, uma série = azul da marca) e `chart-card/` como moldura dos painéis. ECharts é registrado em `echarts.setup.ts` e fornecido só no componente (`provideEchartsCore`), mantendo-o fora do bundle inicial.
  - `expenses/`: Fluxo de listagem (`expense-list/`) e criação/edição (`expense-form/`). Comprador, loja e categoria só cadastrados: o "+ Cadastrar …" dos dropdowns cria o item pela API e já seleciona (com `[createOnBlur]="false"`, para não cadastrar ao sair do campo); categorias vêm só de `CategoriaItem`, sem lista fixa.
  - `admin/`: Painel de administração (`admin.component.ts`), categorias de itens (`item-categories/`), categorias de lojas (`store-categories/`) e perfil de usuário (`user-profile/`, com `telegram-link-card/` para conectar o bot do Telegram via `BotService`) e `users/` (criação de usuários via `AdminUsersService`; rota e card só para `ROLE_FINANCE_ADMIN`: cards com `roles` são filtrados por `AuthService.hasRole`).
  - `buyers/`: Gestão de compradores/pagadores.
  - `stores/`: Gestão de lojas e fornecedores. Categoria só cadastrada: o "+ Cadastrar categoria de loja" cria em Categorias de Lojas pela API e já seleciona (`[createOnBlur]="false"`), sem lista fixa.
  - `payment-methods/`: Gestão de meios e modalidades de pagamento.
  - `bills/`: Contas a pagar (vencimentos do mês, marcar como paga, cadastro) e `bill-alerts-card/` (avisos no dashboard). O `BillsService` expõe o signal `alerts`, usado pelo selo da sidebar.

### 3. `src/app/shared` (Componentes Reutilizáveis e Tipos)
- **Componentes Gerais (`shared/components/general/`):** Componentes comuns de layout e UI (`navbar/`, `sidebar/`, `confirm-modal/`, `notice-modal/`, `searchable-dropdown/`, `a11y-toolbar/`).
- **Modelos e Tipos (`shared/model/types/`):** Interfaces e tipos TypeScript de todas as entidades do domínio financeiro (`admin-user.model.ts`, `analytics.model.ts`, `bill.model.ts`, `bot.model.ts`, `buyer.model.ts`, `category.model.ts`, `lancamento.model.ts`, `payment-method.model.ts`, `store.model.ts`).
- **Mocks (`shared/model/mocks/`):** Mocks e dados estáticos de teste.

## 🌗 Tema e acessibilidade
- **Tokens obrigatórios:** fundo, texto e borda usam os tokens de `styles.css` (`--bg-page`, `--surface`, `--surface-2/3`, `--surface-brand`, `--text-strong`, `--text`, `--text-muted`, `--text-faint`, `--link`, `--border(-subtle|-strong)`, `--success|danger|warning-text|bg|border`). Nunca hex fixo (`#fff`, `#0b132b`…) nessas propriedades: o tema escuro e o alto contraste redefinem os tokens. Cores da marca em fundos sólidos (`#004aad`, gradiente) e texto branco sobre eles podem ficar fixos. A navbar é escura nos dois temas e usa cores fixas.
- **Atributos no `<html>`:** `data-theme="light|dark"` (já resolvido; "seguir o sistema" é o padrão), `data-contrast="high"` e `--a11y-font-scale` (A-/A+, 87,5% a 150%; por isso o layout é todo em `rem`). O script inline do `index.html` aplica tudo antes do Angular (sem piscar), lendo `bf-theme`, `bf-contrast` e `bf-font-scale` do `localStorage`.
- **Serviços:** `ThemeService` (`core/services/theme/`) e `AccessibilityService` (`core/services/accessibility/`, inclui leitura em voz alta pela Web Speech API). A barra flutuante é `shared/components/general/a11y-toolbar/`, incluída no `app.component` (todas as páginas).
- **Gráficos:** `analytics-charts.ts` tem uma paleta por tema (`setChartTheme`); o dashboard recalcula as opções quando `ThemeService.effective()` muda.
- **Páginas públicas** (Início, Sobre, Atualizações) são navy por design e não usam os tokens; só recebem a barra.
- Guias para outros projetos: skills `bluefox-theming` e `bluefox-accessibility` (`.agents/skills/` na raiz do workspace).

## 📅 Datas
- A data da compra (`Lancamento.data`) é gravada como meia-noite UTC (`YYYY-MM-DD` enviado pelo formulário). Exiba sempre em UTC (`date:'dd/MM/yyyy':'UTC'`), senão no Brasil (UTC−3) aparece o dia anterior. Para "hoje", use a data local (`toLocaleDateString('en-CA')`), nunca `toISOString()`.

## 🚀 Comandos Úteis
- **Build de Produção:** `npm run build`
- **Execução Local:** `npm run start` (ou via Docker: `docker compose -f docker-compose.dev.yml up frontend`)
