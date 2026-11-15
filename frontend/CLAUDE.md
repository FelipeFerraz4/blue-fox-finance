# Blue Fox Finance - Frontend Architecture & AI Guidelines

Este documento serve como guia de arquitetura e convenções do frontend do **Blue Fox Finance**, alinhado ao padrão modular estabelecido no ecossistema Blue Fox (referência: `blue-fox-aquarismo`).

## 🏗️ Arquitetura do Frontend (Angular 19 / Core-Feature-Shared)

O projeto segue a arquitetura modular padrão da Blue Fox para escalabilidade e manutenção:

### 1. `src/app/core` (Singletons e Lógica Global)
- **Serviços Globais (`core/services/`):** Serviços de API e provedores compartilhados entre toda a aplicação (`accessibility/`, `admin-users/`, `auth/`, `bot/`, `buyers/`, `categories/`, `analytics/`, `expenses/`, `bills/`, `payment-methods/`, `seo/`, `sidebar/`, `stores/`, `theme/`, `translation/`, `user/`); textos das páginas públicas em `core/content/{pt,en}/` (`common`, `home`, `about`, `updates`).
- **Guards (`core/guards/`):** Proteção de rotas com base em autenticação e papéis (`auth.guard.ts`).
- **Interceptors (`core/interceptors/`):** Interceptação HTTP global como injeção de tokens JWT (`auth.interceptor.ts`).
- **CoreModule (`core/core-module.ts`):** Módulo central de registro.

### 2. `src/app/features` (Páginas e Módulos de Domínio)
- **Páginas Principais (`features/pages/main/`):** Rotas públicas da aplicação (`home/`, `about/`, `updates/`), montadas em `/pt` e `/en` (seção Idiomas).
- **Módulos de Domínio (`features/pages/`):**
  - `dashboard/`: Dashboard único estilo Power BI com filtro cruzado (`analytics.store.ts`), opções dos gráficos em `analytics-charts.ts` (paleta categórica validada para daltonismo, uma série = azul da marca) e `chart-card/` como moldura dos painéis. ECharts é registrado em `echarts.setup.ts` e fornecido só no componente (`provideEchartsCore`), mantendo-o fora do bundle inicial.
  - `expenses/`: Fluxo de listagem (`expense-list/`) e criação/edição (`expense-form/`). Comprador, loja e categoria só cadastrados: o "+ Cadastrar …" dos dropdowns cria o item pela API e já seleciona (com `[createOnBlur]="false"`, para não cadastrar ao sair do campo); categorias vêm só de `CategoriaItem`, sem lista fixa.
  - `admin/`: Painel de administração (`admin.component.ts`), categorias de itens (`item-categories/`), categorias de lojas (`store-categories/`) e perfil de usuário (`user-profile/`, com `telegram-link-card/` para conectar o bot do Telegram via `BotService`) e `users/` (criação de usuários via `AdminUsersService`; rota e card só para `ROLE_FINANCE_ADMIN`: cards com `roles` são filtrados por `AuthService.hasRole`).
  - `buyers/`: Gestão de compradores/pagadores.
  - `stores/`: Gestão de lojas e fornecedores. Categoria só cadastrada: o "+ Cadastrar categoria de loja" cria em Categorias de Lojas pela API e já seleciona (`[createOnBlur]="false"`), sem lista fixa.
  - `payment-methods/`: Gestão de meios e modalidades de pagamento.
  - `bills/`: Contas a pagar (vencimentos do mês, marcar como paga, cadastro) e `bill-alerts-card/` (avisos no dashboard). O `BillsService` expõe o signal `alerts`, usado pelo selo da sidebar.

### 3. `src/app/shared` (Componentes Reutilizáveis e Tipos)
- **Componentes Gerais (`shared/components/general/`):** Componentes comuns de layout e UI (`navbar/`, `sidebar/`, `confirm-modal/`, `notice-modal/`, `searchable-dropdown/`, `a11y-toolbar/`). Cabeçalho e rodapé das páginas públicas em `shared/components/public/` (`public-header/` com o seletor PT | EN, `public-footer/`).
- **Modelos e Tipos (`shared/model/types/`):** Interfaces e tipos TypeScript de todas as entidades do domínio financeiro (`admin-user.model.ts`, `analytics.model.ts`, `bill.model.ts`, `bot.model.ts`, `buyer.model.ts`, `category.model.ts`, `lancamento.model.ts`, `payment-method.model.ts`, `store.model.ts`).
- **Mocks (`shared/model/mocks/`):** Mocks e dados estáticos de teste.

## 🌗 Tema e acessibilidade
- **Tokens obrigatórios:** fundo, texto e borda usam os tokens de `styles.css` (`--bg-page`, `--surface`, `--surface-2/3`, `--surface-brand`, `--text-strong`, `--text`, `--text-muted`, `--text-faint`, `--link`, `--border(-subtle|-strong)`, `--success|danger|warning-text|bg|border`). Nunca hex fixo (`#fff`, `#0b132b`…) nessas propriedades: o tema escuro e o alto contraste redefinem os tokens. Cores da marca em fundos sólidos (`#004aad`, gradiente) e texto branco sobre eles podem ficar fixos. A navbar é escura nos dois temas e usa cores fixas.
- **Atributos no `<html>`:** `data-theme="light|dark"` (já resolvido; "seguir o sistema" é o padrão), `data-contrast="high"` e `--a11y-font-scale` (A-/A+, 87,5% a 150%; por isso o layout é todo em `rem`). O script inline do `index.html` aplica tudo antes do Angular (sem piscar), lendo `bf-theme`, `bf-contrast` e `bf-font-scale` do `localStorage`.
- **Serviços:** `ThemeService` (`core/services/theme/`) e `AccessibilityService` (`core/services/accessibility/`, inclui leitura em voz alta pela Web Speech API). A barra flutuante é `shared/components/general/a11y-toolbar/`, incluída no `app.component` (todas as páginas).
- **Gráficos:** `analytics-charts.ts` tem uma paleta por tema (`setChartTheme`); o dashboard recalcula as opções quando `ThemeService.effective()` muda.
- **Páginas públicas** (Início, Sobre, Atualizações) são navy por design e não usam os tokens; só recebem a barra.
- Guias para outros projetos: skills `bluefox-theming` e `bluefox-accessibility` (`.agents/skills/` na raiz do workspace).

## 🔎 SEO
- **`SeoService`** (`core/services/seo/`, mesmo modelo do Blue Fox Global Group) é iniciado no `AppComponent` e age por rota: rota com `data: { seo: 'home' | 'about' | 'updates' }` recebe, no idioma da URL, title, description, Open Graph/Twitter (`og:locale` + `og:locale:alternate`), canonical absoluto (`https://finance.bluefoxglobalgroup.com/pt/...`), hreflang `pt`/`en`/`x-default` (= pt) e, na home, JSON-LD `WebApplication`; **qualquer outra rota** recebe `robots: noindex, nofollow` e fica sem canonical nem hreflang. Textos no `seo` de cada página em `core/content/{pt,en}`.
- **nginx** também manda `X-Robots-Tag: noindex, nofollow` nas rotas internas e em `/api/` (`map $request_uri`, porque o `try_files` troca o `$uri`). Rota interna nova = incluir no `map` do `nginx.conf`.
- `public/robots.txt` (não bloqueia as internas de propósito: o Google precisa vê-las para ler o noindex), `public/sitemap.xml` (só públicas, as 6 URLs com `xhtml:link` de cada idioma) e `public/og-default.jpg` (1200x630, < 100 KB). O `index.html` tem description e OG padrão para robôs que não executam JS.
- **Prerender** (`@angular/ssr`, `outputMode: 'static'` no `angular.json`, `src/main.server.ts`, `app.config.server.ts`, `app.routes.server.ts`): no build, as 6 páginas públicas viram HTML pronto (`dist/.../browser/pt/index.html`, `en/about/index.html`...) com textos e meta tags, e o navegador as hidrata (`provideClientHydration`). Todo o resto é `RenderMode.Client`: o app sai do `index.csr.html` (não há `index.html` na raiz; o Dockerfile limpa o padrão do nginx). Produção continua só nginx, sem Node.
- **Código que roda no prerender** (construtores e serviços usados pelo `AppComponent` e pelas páginas públicas) não pode tocar `window`/`document`/`localStorage` direto: use `core/utils/browser-storage.ts` (`storageGet`, `storageSet`, `isBrowserEnv`), `DOCUMENT` ou `isPlatformBrowser`. O `AuthService` não cria o Keycloak fora do navegador. O `lang` do `<html>` sai certo no HTML gerado.
- **404 de verdade:** o `map $app_route` do `nginx.conf` lista o que o app atende (sistema interno, URLs antigas e sem idioma); qualquer outro endereço recebe status 404 com o `index.csr.html`, e a rota `**` mostra `NotFoundComponent` no idioma da URL. Rota interna nova = incluir também nesse `map` (além do `$robots_tag`) e no `isAppRoute` do `AppComponent`.
- **Página pública nova:** rota em `publicPages` (`app.routes.ts`) com `data.seo` + redirecionamento da URL sem idioma + textos em `core/content/pt` e `en` (com `seo`) + `PublicPage` no `TranslationService` + regex do `isPublicPage` no `AppComponent` + `PUBLIC_PATHS` em `app.routes.server.ts` + entradas no `sitemap.xml`.

## 🌐 Idiomas (páginas públicas)
- **URL define o idioma** (como no Global Group): `/pt`, `/pt/about`, `/pt/updates` e `/en/...`. `/`, `/home`, `/about` e `/updates` redirecionam (`redirectTo` com `preferredLanguage()`) para a escolha salva em `bf-lang`; sem escolha, navegador em português → `/pt`, outro idioma → `/en`.
- **`TranslationService`** (`core/services/translation/`): signals `lang`, `page` e `content` (dicionário de `core/content/{pt,en}`), `path(page)` para links no idioma atual, `pathIn(lang)` para o seletor e `remember(lang)`. Mantém o `lang` do `<html>` (`pt-BR`/`en`; rotas internas ficam `pt-BR`), usado também pela leitura em voz alta para escolher a voz.
- **Textos:** o arquivo PT define o tipo (`typeof`), e o EN é tipado por ele: campo faltando no inglês quebra o build. Campos `html` (só `<strong>`) vão para `[innerHTML]`; o CSS deles usa `:host ::ng-deep` porque o conteúdo injetado fica fora do encapsulamento.
- **Seletor PT | EN** no cabeçalho (e na gaveta do celular): links reais para a mesma página no outro idioma (o Google segue), com `hreflang`/`lang` e `aria-current`.
- Sistema interno, API e bot continuam em português até as etapas 4 e 5.

## 🗺️ Roadmap: SEO e internacionalização (referência: blue-fox-global-group)
1. ✅ **SEO básico** (acima).
2. ✅ **Páginas públicas em `/pt` e `/en`** (seção Idiomas acima).
3. ✅ **Prerender das públicas** (seção Prerender acima).
4. **Sistema interno traduzido:** sem idioma na URL; preferência do usuário. **Idioma e país são separados:** o idioma escolhe os textos; o **país/região** define moeda e formatação de data e número (ex.: Brasil → BRL, `dd/MM/yyyy`, `1.234,56`; EUA → USD, `MM/dd/yyyy`, `1,234.56`; Portugal → EUR). Preferências em `localStorage` (`bf-lang`, `bf-region`) e no backend (preferências do usuário, para o bot e outros aparelhos). Pipes próprios com `Intl` (o `LOCALE_ID` do Angular é fixo), meses do ECharts por `Intl`, login do Keycloak com `locale`. A moeda é só de exibição (os valores não são convertidos): é a moeda em que o usuário registra os gastos.
5. **API e bot:** `Accept-Language` nas mensagens de erro; o bot usa a preferência salva (ou o `language_code` do Telegram) e formata valores pela região (hoje `BotFormat.brl`).

## 📅 Datas
- A data da compra (`Lancamento.data`) é gravada como meia-noite UTC (`YYYY-MM-DD` enviado pelo formulário). Exiba sempre em UTC (`date:'dd/MM/yyyy':'UTC'`), senão no Brasil (UTC−3) aparece o dia anterior. Para "hoje", use a data local (`toLocaleDateString('en-CA')`), nunca `toISOString()`.

## 🚀 Comandos Úteis
- **Build de Produção:** `npm run build`
- **Execução Local:** `npm run start` (ou via Docker: `docker compose -f docker-compose.dev.yml up frontend`)
