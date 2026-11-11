# Blue Fox Finance - Contexto de Engenharia & IA

Este documento serve como guia de contexto para assistentes de IA no repositório **Blue Fox Finance**. Para a especificação detalhada de cada pasta, módulo e entidade, consulte também [AGENTS.md](./AGENTS.md).

## 🌌 Visão Geral do Domínio
A **Blue Fox Finance** é o sistema central de controle financeiro do ecossistema Blue Fox.
- **Entidades principais:** Lançamentos/Despesas (`Lancamento`), Compradores (`Buyer`), Lojas (`Store`), Categorias (`CategoriaItem`, `CategoriaLoja`), Meios de Pagamento (`PaymentMethod`), Contas a Pagar (`ContaPagar` + ocorrências `PagamentoConta`), Usuários criados pelo admin (`Usuario`, registro de auditoria; a conta vive no Keycloak).
- **Autenticação & IAM:** SSO federado via Keycloak (Blue Fox IAM).

## 🏗️ Arquitetura do Frontend (Angular 19)

### Estrutura de Pastas (Core-Feature-Shared)
O frontend segue o padrão arquitetural modular unificado da Blue Fox:
- `src/app/core`: Singletons e lógica global (`AuthService`, interceptors, guards e serviços globais de API em `core/services/<nome>/`).
- `src/app/features`: Módulos de página e fluxos da aplicação em `features/pages/`:
  - `main/`: Rotas públicas (`home/`, `about/`, `updates/`).
  - `expenses/`: Fluxo de listagem (`expense-list/`) e criação (`expense-form/`).
  - `admin/`: Painel administrativo com categorias de itens/lojas e perfil de usuário.
  - `dashboard/`: o **Dashboard** (tela única) estilo Power BI (ECharts via `ngx-echarts`, registrado só no componente para ficar no chunk lazy). O backend devolve as linhas do ano numa chamada e o filtro cruzado roda no cliente (`analytics.store.ts`, Signals): cada painel agrega com todos os filtros exceto o da própria dimensão. A coluna/linha inteira de cada barra é clicável (`bindCategoryClick`).
  - `buyers/`, `stores/`, `payment-methods/`, `bills/`: Módulos de páginas de domínio (`bills/` = Contas a Pagar, com `bill-alerts-card/` exibido no topo do dashboard).
- `src/app/shared`:
  - `components/general/`: Componentes reutilizáveis de layout (`navbar`, `sidebar`, `confirm-modal`, `notice-modal`, `searchable-dropdown`).
  - `model/types/`: Interfaces e tipos TypeScript de domínio.
  - `model/mocks/`: Dados de teste.

## 🏗️ Arquitetura do Backend (NestJS 10 + Prisma 6)

### Estrutura de Módulos (`backend/src/modules`)
- `auth`: Autenticação JWT via Keycloak, `JwtAuthGuard`, `RolesGuard`, decorators `@Roles()`, `@Public()`, `@CurrentUser()`. Roles em `roles.constants.ts` (espelho do realm). Todo controller de domínio leva `@Roles(...FINANCE_ACCESS_ROLES)` na classe (`ROLE_ADMIN`, `ROLE_FINANCE_ADMIN`, `ROLE_FINANCE_USER`); no frontend, as rotas internas usam `data: { roles: FINANCE_ACCESS_ROLES }`.
- `buyers`: Módulo de compradores (`buyers.controller.ts`, `buyers.service.ts`, `buyer.dto.ts`).
- `categories`: Categorias de itens e de lojas (`categories.controller.ts`, `categories.service.ts`).
- `expenses`: Gestão de despesas, cálculo de parcelas e faturas de cartão (`expenses.controller.ts`, `expenses.service.ts`). **Comprador, loja e categoria precisam estar cadastrados** (site, bot e API): `compradorId`/`lojaId` obrigatórios no create, categoria conferida em `CategoriaItem`; os nomes gravados vêm do cadastro (o texto enviado é ignorado). No update, só é exigido quando o campo é alterado, então lançamentos antigos com texto solto continuam editáveis em outros campos.
- `payment-methods`: Meios de pagamento (`payment-methods.controller.ts`, `payment-methods.service.ts`).
- `analytics`: API do Dashboard, `GET /api/analytics?year=&basis=fatura|compra`. O Dashboard usa só `fatura` (cada parcela no mês em que é paga; não há seletor na tela); `compra` continua disponível na API. `facts` = lançamentos do ano pela data da compra (mês em UTC, datas são meia-noite UTC) ou parcelas pelo `mesReferencia`; também `anoAnterior` (12 totais), `compromissosFuturos` (parcelas não pagas dos próximos 12 meses + parcelamentos em aberto) e `contas` (`BillsService.getYearSummary`).
- `bills`: Contas a pagar recorrentes (mensal, anual, avulsa). `ContaPagar` é a regra; `PagamentoConta` é a ocorrência de cada mês, criada sob demanda (`ensureOccurrences`) desde `dataInicio`, então mês nunca aberto também aparece como atrasado. Nada é pago automaticamente: o usuário confirma o pagamento já feito ("Confirmar pagamento" no site e no bot; `/occurrences/:id/pay`). Conta vinculada a cartão de crédito usa como valor a soma das parcelas do mês e, ao pagar, marca `Parcela.pago`. Status (`PAGA`, `ATRASADA`, `VENCE_HOJE`, `PROXIMA`, `PENDENTE`) é calculado com "hoje" no fuso `APP_TIMEZONE` (padrão `America/Sao_Paulo`). `/bills/alerts` alimenta o selo do menu e o card do dashboard.
  - **Fase futura (notificações):** cron diário (`@nestjs/schedule`, 8h de SP) reaproveitando `getAlerts` para todos os usuários; canal a definir (e-mail via claim `email` do Keycloak, Web Push ou Telegram); colunas `notificadoAntesEm`/`notificadoNoDiaEm` em `PagamentoConta` para não notificar duas vezes.
- `bot`: bot do Telegram (Fase 1: `/lancamento`, `/resumo`, `/contas`, `/ultimos`; Fase 2: `/cadastrar`). Núcleo canal-agnóstico (`BotEngineService` + `flows/`) que chama os mesmos services do site com o `userId` do vínculo; `telegram/` é só o adaptador (grammY), então o WhatsApp entra como outro adaptador e a IA como outro intérprete.
  - **Vínculo:** o perfil do site gera um código de uso único (10 min, só o hash no banco) e o deep link `t.me/<bot>?start=<código>`; o `/start <código>` grava `BotVinculo` (1 conta ↔ 1 Telegram, só chat privado). Roles são checadas ao gerar o código, não a cada mensagem.
  - **Conversa:** estado em `BotConversa` (sobrevive a deploy); cada botão leva o `nonce` do estado e `consumeState` garante que Salvar/Confirmar pagamento não executem duas vezes. Texto solto fora de um fluxo (ex.: "oi"), comando desconhecido e `/ajuda` mostram o menu inicial com o que cada comando faz; ao terminar uma operação o menu não é reenviado. Lançamentos do bot têm `Lancamento.origem = TELEGRAM` só para auditoria: na listagem são exibidos iguais aos do site.
  - **Assistente `/lancamento`** (o Telegram só aceita `a-z0-9_` em comandos; `/lançamento` digitado também funciona, e `/gasto` ficou como apelido): pergunta campo a campo na mesma ordem e com os mesmos rótulos da tela "Novo Lançamento" (Comprador, Loja, Data da Compra, Meio de Pagamento, Tipo de Pagamento/Número de Parcelas, Nome, Categoria, Quantidade, Valor Unitário) e envia o mesmo payload. Padrões do perfil (e a categoria da loja) aparecem como primeira opção ⭐, nunca preenchidos sem perguntar; o atalho `45,90 pão @ padaria` só pré-preenche valor/nome/loja.
  - **Config:** sem `TELEGRAM_BOT_TOKEN` o bot fica desligado. Produção: `TELEGRAM_MODE=webhook` + `PUBLIC_API_URL` (https) + `TELEGRAM_WEBHOOK_SECRET` (o webhook `POST /api/bot/telegram` é `@Public` e valida o header `X-Telegram-Bot-Api-Secret-Token`). Dev: `TELEGRAM_MODE=polling` (sem URL pública). Crie o bot no @BotFather (`/newbot`). Use um bot de teste no dev: polling e webhook no mesmo token se anulam.
  - **Cadastros (`/cadastrar`, `flows/register.flow.ts` + `register.forms.ts`):** loja, comprador, meio de pagamento, categoria de item, categoria de loja e conta a pagar. Cada cadastro é um `FormSpec` com os mesmos campos, rótulos, ordem e regras de visibilidade do formulário do site (ex.: fechamento/vencimento só para crédito; Dia/Valor somem com cartão vinculado); um motor genérico pergunta campo a campo (opcionais com botão Pular/Variável/Este mês…), mostra o resumo com botões de alterar, valida com o mesmo DTO da API (`class-validator`) e grava pelo service do site. Campo que fica escondido perde a resposta. Erro do service (ex.: nome repetido) volta ao resumo sem perder o que foi digitado. Atalhos: `/novaloja`, `/novocomprador`, `/novomeio`, `/novacategoria`, `/novacategorialoja`, `/novaconta` (o texto depois do comando vira o Nome).
  - **Cadastro no meio do lançamento:** nas perguntas de Comprador, Loja, Meio de Pagamento e Categoria, um texto que não existe oferece só **➕ Cadastrar** (abre o `RegisterFlow` com o nome preenchido) ou **Escolher outro**: no bot, comprador, loja, meio e categoria do lançamento precisam estar cadastrados; cada pergunta também tem o botão **➕ Nova …**. O cadastro guarda o rascunho em `resume`: ao salvar volta ao lançamento com o item escolhido (`ExpenseFlow.resume`), ao cancelar volta à mesma pergunta. Loja inexistente no atalho `@ loja` é tratada ao chegar na Loja, e `/lancamento` sem meio de pagamento abre o cadastro do meio. `ExpenseFlow` e `RegisterFlow` se referenciam com `forwardRef`.
  - **Próximas fases:** texto livre com IA (Claude) e foto de cupom, WhatsApp (Cloud API oficial).
- `users`: criação de usuários pela tela **Admin → Usuários** (`/admin/users`, só `ROLE_FINANCE_ADMIN` no front e na API). `KeycloakAdminService` usa a Admin REST API com a service account do client confidencial (`KEYCLOAK_ADMIN_CLIENT_ID`/`KEYCLOAK_ADMIN_CLIENT_SECRET`, URLs derivadas do `KEYCLOAK_ISSUER_URI`), que precisa dos papéis `realm-management` **manage-users** e **view-users**. Cria a conta (login = e-mail) com senha temporária (`UPDATE_PASSWORD` obrigatório no 1º login) e os papéis fixos `NEW_USER_ROLES` (`ROLE_FINANCE_USER` + `ROLE_USER`, nunca vindos do cliente); registra em `Usuario` (`keycloakId`, quem criou). Se atribuir papéis ou gravar no banco falhar, apaga a conta do Keycloak. Sem as variáveis, a tela avisa que não está configurada. A senha não é salva no Finance.
- `stores`: Gestão de lojas e fornecedores (`stores.controller.ts`, `stores.service.ts`).
- `prisma`: Módulo global com `PrismaService` conectado ao PostgreSQL.

### Modelagem Prisma (`backend/prisma`)
- Esquema modular em `prisma/schema/*.prisma` (`base.prisma`, `usuario.prisma`, `categoria.prisma`, `loja.prisma`, `pagamento.prisma`, `lancamento.prisma`, `conta.prisma`, `bot.prisma`, `preferencia.prisma`).
- **Prisma 6** configurado por `backend/prisma.config.ts` (caminho do schema em pasta e das migrations; carrega o `.env` via `dotenv`). A CLI `prisma` é dependência de produção porque o container roda as migrations na inicialização.
- **Migrations versionadas** em `prisma/migrations/`. Toda mudança de schema exige migration: `npm run prisma:migrate:dev -- --name <nome>`. Nunca use `db push --accept-data-loss`. O container roda `docker-entrypoint.sh`: baseline automático de bancos legados criados via `db push` (falha em vez de perder dados), `prisma migrate deploy` e `node dist/src/main`.
- **Sem seeds automáticos**: tudo é isolado por `userId` (`sub` do token, via `@CurrentUser('sub')`) e cada usuário começa vazio. Para desenvolvimento há um seed de demonstração manual, que nunca roda no container: `SEED_USER_ID=<sub do Keycloak> npm run seed:demo` (`prisma/seeds/demo.seed.ts`, ~2 anos de lançamentos, contas e parcelamentos; `SEED_RESET=true` apaga e recria os dados daquele usuário; recusa `NODE_ENV=production`). Todo service filtra por `userId` e valida que IDs referenciados (comprador, loja, meio de pagamento) pertencem ao usuário.

## 🚀 Comandos Úteis
- **Frontend Build:** `cd frontend && npm run build`
- **Frontend Dev:** `cd frontend && npm run start`
- **Backend Dev:** `cd backend && npm run start:dev`
- **Docker Dev:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`

## 🚢 Deploy automático (CI/CD)
- Workflow: `.github/workflows/quality-gate.yml` (mesmo padrão do Aquarismo e do Blog Backend).
- Fluxo: trabalho na `develop` → PR `develop` → `main` roda o **Quality Gate** → o merge (push na `main`) ou `workflow_dispatch` dispara o **Deploy to VPS**.
- Quality Gate (um job só, para backend e frontend): `npm ci`, `npm audit --audit-level=critical`, `prisma generate`, `migrate deploy` num Postgres de serviço + `migrate diff --exit-code` (falha se faltar migration), build do backend, build de produção do frontend e `docker build` das duas imagens.
- Node do CI = Node dos Dockerfiles (22 / npm 10). Lockfile gerado com npm 11 quebra o `npm ci`; regenere com `npx -y npm@10 install --package-lock-only --ignore-scripts`.
- O `frontend/package.json` tem `overrides` (`piscina`, `tar`) para zerar vulnerabilidades críticas que o Angular 19 fixa; podem ser removidos ao migrar o Angular.
- Deploy: SSH (`appleboy/ssh-action`) na pasta `~/apps/blue-fox/blue-fox-finance` do usuário `deployer`, `git reset --hard origin/main` e `docker compose ... --env-file .env.prod up -d --build`. O `.env.prod` real precisa existir na VPS.
- **Healthcheck:** `GET /api/health` (público; responde 503 se o banco cair) alimenta o healthcheck do container da API no compose; o front usa `wget` no nginx. Depois do `up`, o deploy espera os dois ficarem `healthy` (até 3 min) e falha em vermelho com os últimos logs se não ficarem.
- Secrets do repo: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, opcionais `VPS_PORT` e `VPS_APP_PATH`.
