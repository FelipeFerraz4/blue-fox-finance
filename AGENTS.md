# Blue Fox Finance - Contexto de Engenharia & Guia de Arquitetura para IA

Este documento serve como a fonte canônica da verdade sobre a arquitetura, estrutura de pastas, convenções e domínio do **Blue Fox Finance** (Frontend e Backend). Ele foi concebido para orientar assistentes e agentes de IA a navegarem e sugerirem código com precisão total.

---

## 🌌 Visão Geral do Domínio

A **Blue Fox Finance** é a plataforma de gestão financeira e despesas corporativas/pessoais do ecossistema Blue Fox.
- **Domínio Principal:** Gestão de despesas (`lancamentos`), faturas de cartão, parcelamentos, categorização de itens e lojas, gestão de compradores/pagadores e meios de pagamento.
- **Segurança & IAM:** Autenticação centralizada via Keycloak (Blue Fox IAM), validação de tokens JWT RS256 e controle de acesso baseado em papéis (`roles`).
- **Banco de Dados:** PostgreSQL com Prisma ORM e esquemas multi-arquivos (`prisma/schema/*.prisma`).

---

## 🏗️ 1. Arquitetura do Frontend (Angular 19)

O frontend segue estritamente o padrão arquitetural **Core-Feature-Shared** adotado em todo o ecossistema Blue Fox (referência: `blue-fox-aquarismo`).

### 📂 Mapa Completo de Pastas do Frontend (`frontend/src/app`)

```text
frontend/src/app/
├── core/                                             # Singletons, lógica global, auth, interceptors e guards
│   ├── core-module.ts                                # Módulo raiz do Core
│   ├── guards/
│   │   └── auth.guard.ts                             # Guard funcional de rotas com validação de login e roles Keycloak
│   ├── interceptors/
│   │   └── auth.interceptor.ts                       # Interceptor HTTP que anexa Bearer token e executa refresh
│   └── services/                                     # Serviços de comunicação com a API (um diretório por serviço)
│       ├── auth/
│       │   └── auth.service.ts                       # Gerenciador SSO Keycloak (login, logout, tokens, signals de perfil)
│       ├── buyers/
│       │   └── buyers.service.ts                     # CRUD de compradores (/api/buyers)
│       ├── categories/
│       │   └── categories.service.ts                 # CRUD de categorias de itens e lojas (/api/categories)
│       ├── dashboard/
│       │   └── dashboard.service.ts                  # Métricas e indicadores consolidados (/api/dashboard)
│       ├── expenses/
│       │   └── expenses.service.ts                   # Gestão de despesas, parcelas e preview (/api/expenses)
│       ├── payment-methods/
│       │   └── payment-methods.service.ts            # CRUD de meios de pagamento e cartões (/api/payment-methods)
│       ├── sidebar/
│       │   └── sidebar.service.ts                    # Estado reativo do menu lateral (collapse/mobile)
│       ├── stores/
│       │   └── stores.service.ts                     # CRUD de lojas e fornecedores (/api/stores)
│       └── user/
│           └── user.service.ts                       # Preferências de perfil e avatares do sistema
│
├── features/                                         # Módulos de páginas e fluxos funcionais
│   └── pages/
│       ├── main/                                     # Páginas institucionais e públicas
│       │   ├── home/
│       │   │   └── home.component.ts                 # Landing page com apresentação do ecossistema
│       │   ├── about/
│       │   │   └── about.component.ts                # Página "Sobre a Blue Fox Finance"
│       │   └── updates/
│       │       └── updates.component.ts              # Changelog e notas de versão
│       ├── dashboard/
│       │   └── dashboard.component.ts                # Dashboard financeiro com resumos e cartões
│       ├── expenses/                                 # Módulo de gestão de despesas
│       │   ├── expense-list/
│       │   │   └── expense-list.component.ts         # Listagem paginada, filtros, faturas e ações
│       │   └── expense-form/
│       │       └── expense-form.component.ts         # Formulário de lançamento e parcelamentos dinâmicos
│       ├── buyers/
│       │   └── buyers.component.ts                   # Gestão e listagem de compradores
│       ├── stores/
│       │   └── stores.component.ts                   # Gestão de lojas e vínculos de categoria
│       ├── payment-methods/
│       │   └── payment-methods.component.ts          # Gestão de cartões, contas e modalidades
│       └── admin/                                    # Painel de administração
│           ├── admin.component.ts                    # Hub de módulos administrativos
│           ├── item-categories/
│           │   └── item-categories.component.ts      # Gestão de categorias de despesa/itens
│           ├── store-categories/
│           │   └── store-categories.component.ts     # Gestão de segmentos de lojas
│           └── user-profile/
│               └── user-profile.component.ts         # Visualização de perfil e dados Keycloak
│
├── shared/                                           # Componentes reutilizáveis, tipos e mocks
│   ├── components/
│   │   └── general/                                  # Componentes visuais globais
│   │       ├── navbar/
│   │       │   └── navbar.component.ts               # Header da aplicação com perfil e navegação
│   │       ├── sidebar/
│   │       │   └── sidebar.component.ts              # Menu lateral expansível/recolhível
│   │       ├── confirm-modal/
│   │       │   └── confirm-modal.component.ts        # Modal reutilizável para confirmação de ações
│   │       ├── notice-modal/
│   │       │   └── notice-modal.component.ts         # Modal de aviso informativo e avisos do sistema
│   │       └── searchable-dropdown/                  # Dropdown com busca inteligente, multi-seleção e personalização
│   │           ├── searchable-dropdown.component.ts  # Lógica, estados, inputs/outputs e ControlValueAccessor
│   │           ├── searchable-dropdown.component.html # Template HTML estruturado e acessibilidade
│   │           ├── searchable-dropdown.component.css # Estilos encapsulados, design tokens e animações
│   │           ├── searchable-dropdown.model.ts      # Modelos tipados e variantes
│   │           └── index.ts                          # Exportador unificado
│   └── model/
│       ├── mocks/                                    # Dados simulados para testes
│       └── types/                                    # Modelos e interfaces TypeScript do domínio
│           ├── buyer.model.ts                        # Interface Buyer e DTOs
│           ├── category.model.ts                     # Interfaces CategoriaItem e CategoriaLoja
│           ├── dashboard.model.ts                    # Interfaces de estatísticas e visão geral
│           ├── lancamento.model.ts                   # Interfaces de Lançamento, parcelas e filtros
│           ├── payment-method.model.ts               # Interface PaymentMethod e modalidades
│           ├── store.model.ts                        # Interface Store e DTOs
│           └── index.ts                              # Barrel export consolidado
│
├── app.component.ts                                  # Componente raiz gerenciador de layouts
├── app.config.ts                                     # Provedores da aplicação (Router, Interceptor, Locale pt-BR)
└── app.routes.ts                                     # Configuração de rotas e lazy loading
```

### 🎯 Diretrizes do Frontend
1. **Padrão Core-Feature-Shared:**
   - Todo novo serviço compartilhado pertence a `src/app/core/services/<nome>/`.
   - Novos componentes compartilhados pertencem a `src/app/shared/components/<categoria>/`.
   - Novas páginas de negócio pertencem a `src/app/features/pages/<fluxo>/`.
   - Novas interfaces e DTOs pertencem a `src/app/shared/model/types/`.
2. **Standalone Components:** Todos os componentes utilizam `standalone: true`.
3. **Reatividade:** Priorizar Angular **Signals** (`signal()`, `computed()`) para estados locais e **RxJS** para pipelines assíncronos HTTP.
4. **Layout:** A alternância entre layout público (`isPublicPage`) e logado (Navbar + Sidebar) é gerenciada em `app.component.ts`.
5. **Divisão de Arquivos dos Componentes (Multi-File Pattern):**
   - **Padrão Obrigatório:** Para garantir manutenibilidade, legibilidade e suporte de tooling na IDE, todo componente de médio ou grande porte deve ser dividido em arquivos dedicados:
     - `<nome>.component.ts` (lógica TypeScript, decoradores, inputs/outputs e lifecycle hooks).
     - `<nome>.component.html` (marcação HTML, slots, `ng-template` e acessibilidade via `templateUrl`).
     - `<nome>.component.css` (estilos encapsulados do componente via `styleUrl`).
     - `<nome>.model.ts` (interfaces, tipos e enums específicos do componente, quando houver).
     - `index.ts` (barrel export facilitando importações limpas).
   - **Evitar Monólitos:** Não utilizar templates e estilos inline (`template: '...'` e `styles: ['...']` dentro do `.ts`) em componentes complexos, evitando arquivos que ultrapassem centenas de linhas.

---

### 🔍 Componente Compartilhado: SearchableDropdown (`<app-searchable-dropdown>`)

O `SearchableDropdownComponent` é o componente padrão do ecossistema Blue Fox para campos de seleção com busca rápida, suporte a itens primitivos ou entidades de dados, seleção simples ou múltipla, tags e alta capacidade de personalização visual e comportamental.

- **Localização:** `src/app/shared/components/general/searchable-dropdown/`
- **Seletor:** `<app-searchable-dropdown>`
- **Exportações:** `SearchableDropdownComponent`, `DropdownOption<T>`, `DropdownGroup<T>`, `DropdownSize`, `DropdownVariant`, `DropdownRounded`, `BadgeColorVariant`.

#### ✨ Recursos Principais
- **ControlValueAccessor:** Totalmente compatível com `[(ngModel)]`, `[formControl]` e `formControlName`.
- **Busca Inteligente:** Filtragem em tempo real ignorando diacríticos/acentos (`normalize('NFD')`) e *case-insensitive*.
- **Multi-seleção com Tags:** Ativado via `[multiple]="true"`, exibe chips removíveis, contador de itens excedentes e botões de ação rápida ("Selecionar todos", "Limpar seleção").
- **Agrupamento Automático:** Suporte a separação por grupos/categorias via `groupField`.
- **Criação de Itens Dinâmicos:** Ativado via `[allowCreate]="true"`, emite o evento `(createNew)` quando o usuário digita um valor não catalogado.
- **Totalmente Estilizável:**
  - `size`: `'sm'`, `'md'`, `'lg'`
  - `variant`: `'default'`, `'primary'`, `'outline'`, `'navy'`, `'ghost'`
  - `rounded`: `'sm'`, `'md'`, `'lg'`, `'pill'`
  - `invalid`: Ativa o feedback visual de erro compatível com o formulário.
  - `loading`: Exibe indicador visual de carregamento integrado.
- **Templates Customizados (Content Projection):**
  - `[customOptionTemplate]`: Customização do layout de cada linha da lista.
  - `[customTriggerTemplate]`: Customização do gatilho/botão fechado.
  - `[customHeaderTemplate]` e `[customFooterTemplate]`: Inserção de cabeçalhos/rodapés adicionais no painel suspenso.
  - `[emptyTemplate]`: Customização da mensagem de nenhum resultado encontrado.
- **Teclado & Acessibilidade:** Navegação por setas (cima/baixo), seleção com Enter, saída com Esc e fechamento automático ao clicar fora.

#### 📋 Principais Inputs e Outputs

| Propriedade / Evento | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `[options]` | `any[]` | `[]` | Lista de itens (primitivos, `DropdownOption` ou entidades como `Buyer`, `Store`) |
| `[value]` / `[(ngModel)]` | `any` | `null` | Valor selecionado (ou array de valores se `multiple` for `true`) |
| `[multiple]` | `boolean` | `false` | Habilita seleção múltipla com chips |
| `[placeholder]` | `string` | `'Selecione uma opção...'` | Texto padrão do gatilho |
| `[searchPlaceholder]` | `string` | `'Pesquisar...'` | Placeholder do campo de busca |
| `[showSearch]` | `boolean` | `true` | Exibe/oculta a barra de busca no painel |
| `[clearable]` | `boolean` | `true` | Exibe ícone para limpar o valor selecionado |
| `[disabled]` | `boolean` | `false` | Desabilita o componente |
| `[loading]` | `boolean` | `false` | Exibe animação de carregamento |
| `[invalid]` | `boolean` | `false` | Aplica estilo de erro de validação |
| `[valueField]` | `string` | `'value'` | Campo da entidade mapeado como valor (ex: `'id'`) |
| `[labelField]` | `string` | `'label'` | Campo exibido como rótulo principal (ex: `'nome'`) |
| `[sublabelField]` | `string` | `'sublabel'` | Campo exibido como texto auxiliar secundário |
| `[groupField]` | `string` | `'group'` | Campo utilizado para agrupamento visual |
| `[allowCreate]` | `boolean` | `false` | Permite criar novos itens dinamicamente |
| `[createOptionText]` | `string` | `'+ Adicionar item:'` | Rótulo do botão de criação dinâmica |
| `(valueChange)` | `EventEmitter<any>` | - | Notifica alterações de valor |
| `(optionSelect)` | `EventEmitter<DropdownOption>` | - | Emite a opção selecionada |
| `(createNew)` | `EventEmitter<string>` | - | Emite o texto pesquisado para criação |

#### 💡 Exemplos de Uso

```html
<!-- 1. Seleção Única de Comprador com [(ngModel)] -->
<app-searchable-dropdown
  [options]="buyers"
  valueField="id"
  labelField="nome"
  placeholder="Selecione um comprador..."
  [(ngModel)]="selectedBuyerId"
></app-searchable-dropdown>

<!-- 2. Seleção Múltipla com Chips e Variante Primária -->
<app-searchable-dropdown
  [options]="categories"
  [multiple]="true"
  valueField="id"
  labelField="nome"
  variant="primary"
  [(ngModel)]="selectedCategoryIds"
></app-searchable-dropdown>

<!-- 3. Seleção com Criação Rápida de Nova Loja -->
<app-searchable-dropdown
  [options]="stores"
  valueField="id"
  labelField="nome"
  sublabelField="categoria"
  [allowCreate]="true"
  createOptionText="+ Cadastrar nova loja:"
  [(ngModel)]="selectedStoreId"
  (createNew)="onCadastrarNovaLoja($event)"
></app-searchable-dropdown>
```

---

## 🏗️ 2. Arquitetura do Backend (NestJS 11 + Prisma ORM)

O backend é uma API REST modular construída com NestJS, tipada com TypeScript, com documentação Prisma e integração nativa com o Keycloak.

### 📂 Mapa Completo de Pastas do Backend (`backend/src`)

```text
backend/src/
├── app.module.ts                                     # Módulo raiz com importação dos submódulos e guards globais
├── globals.d.ts                                      # Declarações de tipagem global
├── main.ts                                           # Bootstrap da API (porta 3000, prefixo /api, CORS, ValidationPipe)
│
├── common/                                           # Utilitários, helpers e constantes compartilhadas
│   └── helpers/
│       └── invoice-calculator.helper.ts              # Cálculo de faturas de cartão e virada de ciclo
│
├── prisma/                                           # Provedor do cliente Prisma
│   ├── prisma.service.ts                             # Extensão do PrismaClient com lifecycle hooks
│   └── prisma.module.ts                              # Módulo global exportando o PrismaService
│
└── modules/                                          # Módulos de domínio desacoplados
    ├── auth/                                         # Módulo de Autenticação & Autorização Keycloak
    │   ├── auth.module.ts                            # Registro do Passport e estratégia JWT
    │   ├── jwt.strategy.ts                           # Estratégia Passport decodificando JWT do Keycloak
    │   ├── jwt-auth.guard.ts                         # Guard global para autenticação obrigatória
    │   ├── roles.guard.ts                            # Guard global para checagem de permissões (@Roles)
    │   ├── roles.decorator.ts                        # Decorator @Roles('admin', ...)
    │   ├── public.decorator.ts                       # Decorator @Public() para rotas abertas
    │   └── current-user.decorator.ts                 # Decorator @CurrentUser() para injeção do usuário
    │
    ├── buyers/                                       # Gestão de compradores/pagadores
    │   ├── buyers.controller.ts                      # Endpoints: GET, POST, PUT, DELETE /api/buyers
    │   ├── buyers.service.ts                         # Regras de negócio e persistência via Prisma
    │   ├── buyers.module.ts
    │   └── dto/
    │       └── buyer.dto.ts                          # DTOs validados via class-validator
    │
    ├── categories/                                   # Categorias de Itens e de Lojas
    │   ├── categories.controller.ts                  # Endpoints: /api/categories/itens e /api/categories/lojas
    │   ├── categories.service.ts
    │   ├── categories.module.ts
    │   └── dto/
    │       └── category.dto.ts
    │
    ├── dashboard/                                    # Painel de métricas e indicadores
    │   ├── dashboard.controller.ts                   # Endpoint: GET /api/dashboard
    │   ├── dashboard.service.ts                      # Agregação de totais mensais, por categoria e faturas
    │   └── dashboard.module.ts
    │
    ├── expenses/                                     # Gestão financeira de lançamentos
    │   ├── expenses.controller.ts                    # Endpoints: /api/expenses (CRUD, preview parcelas, status)
    │   ├── expenses.service.ts                       # Lógica de parcelamento, virada de fatura e agregação
    │   ├── expenses.module.ts
    │   └── dto/
    │       └── expense.dto.ts
    │
    ├── payment-methods/                              # Meios e modalidades de pagamento
    │   ├── payment-methods.controller.ts             # Endpoints: /api/payment-methods (Cartões, Contas, Pix, etc.)
    │   ├── payment-methods.service.ts
    │   ├── payment-methods.module.ts
    │   └── dto/
    │       └── payment-method.dto.ts
    │
    └── stores/                                       # Lojas e fornecedores cadastrados
        ├── stores.controller.ts                      # Endpoints: GET, POST, PUT, DELETE /api/stores
        ├── stores.service.ts
        ├── stores.module.ts
        └── dto/
            └── store.dto.ts
```

### 📂 Modelagem de Dados (`backend/prisma`)

O Prisma utiliza o recurso de múltiplos esquemas (`prismaSchemaFolder`):
```text
backend/prisma/
├── schema/
│   ├── base.prisma                                   # Configuração de datasource postgresql e client
│   ├── usuario.prisma                                # Modelo Usuario e roles
│   ├── categoria.prisma                              # Modelos CategoriaItem e CategoriaLoja
│   ├── loja.prisma                                   # Modelo Loja vinculado à CategoriaLoja
│   ├── pagamento.prisma                              # Modelo MeioPagamento e ModalidadePagamento
│   └── lancamento.prisma                             # Modelos Lancamento e ItemLancamento
├── seeds/                                            # Scripts de carga inicial de banco
│   ├── index.ts
│   ├── usuarios.seed.ts
│   ├── categorias-itens.seed.ts
│   ├── categorias-lojas.seed.ts
│   ├── lojas.seed.ts
│   └── pagamentos.seed.ts
└── seed.ts                                           # Orquestrador do comando npx prisma db seed
```

---

## 🔒 3. Segurança e Convenções de API

1. **Guards Globais:** `JwtAuthGuard` e `RolesGuard` estão registrados como `APP_GUARD` no `app.module.ts`. Toda rota é fechada por padrão, a menos que decorada com `@Public()`.
2. **Keycloak Integration:** O frontend obtém o token JWT via `keycloak-js` e o repassa via header `Authorization: Bearer <token>`. O backend decodifica as roles em `realm_access.roles`.
3. **Validação:** Todas as requisições com body passam por `ValidationPipe` do NestJS com `whitelist: true`.

---

## 🚀 4. Comandos e Execução

### Raiz do Repositório (Docker Compose)
```bash
# Ambiente de Desenvolvimento
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Ambiente de Produção
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Frontend (`frontend/`)
```bash
npm run start     # Executa servidor de dev na porta 4200
npm run build     # Compila a aplicação para produção (dist/)
```

### Backend (`backend/`)
```bash
npm run start:dev        # Executa a API em modo watch (porta 3000)
npx prisma migrate dev   # Aplica migrações no banco de dados
npx prisma db seed       # Executa sementes iniciais
```

---

## 📝 5. Padrão de Commits

Todo commit no ecossistema Blue Fox segue as diretrizes da skill `bluefox-commits`:
- **Idioma:** Inglês exclusivamente.
- **Formato:** Conventional Commits (`feat(...)`, `fix(...)`, `refactor(...)`, `docs(...)`, etc.).
- **Escopos comuns:** `frontend`, `backend`, `auth`, `expenses`, `dashboard`, `docker`.
