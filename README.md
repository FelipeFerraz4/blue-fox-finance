# 🦊 BlueFox Spend - Gestão e Controle de Gastos Financeiros

Sistema web completo para gestão e controle de gastos (*Spend Management*), compras com cartões de crédito e débito, regras de fechamento e vencimento de faturas, parcelamentos, múltiplos compradores e dashboard analítico.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [Angular](https://angular.dev/) (Standalone Components, Signals, Reactive Forms, Localização pt-BR).
- **Backend**: [NestJS](https://nestjs.com/) (TypeScript, arquitetura modular com pasta `src/modules/` e auxiliares em `src/common/`).
- **ORM & Banco de Dados**: [Prisma ORM](https://www.prisma.io/) com **PostgreSQL 16**.
- **Infraestrutura**: **Docker** e **Docker Compose** com volume de dados local para persistência garantida.

---

## 🚀 Como Executar com Docker Compose (Recomendado)

O projeto está totalmente configurado para subir todos os serviços com um único comando:

```bash
# 1. Navegue até o diretório do projeto
cd blue-fox-spend

# 2. Suba os containers com build automático
docker compose up -d --build
```

Após os containers iniciarem:
- 🌐 **Frontend (Angular)**: [http://localhost:4200](http://localhost:4200)
- 🔌 **Backend (NestJS API)**: [http://localhost:3000/api](http://localhost:3000/api)
- 🗄️ **Banco PostgreSQL**: `localhost:5435` (ou porta 5432 interna na rede Docker)

Os dados do banco de dados ficam salvos de forma persistente no diretório local:
`./data/postgres`

---

## 📦 Inicialização e Seeds Automáticos

Na primeira inicialização, o container do backend executa automaticamente:
1. `prisma db push` para criar as tabelas no PostgreSQL.
2. `prisma:seed` para pré-carregar os meios de pagamento padrão:
   - **Dinheiro**
   - **Pix**
   - **Boleto Bancário**
   - **TED / Transferência**

O usuário pode então acessar a tela de **Meios de Pagamento** para cadastrar seus cartões de crédito e débito personalizados!

---

## 🖥️ Páginas e Funcionalidades do Sistema

### 1. 📊 Dashboard (`/dashboard`)
- **KPIs Principais**:
  - `TOTAL A PAGAR ESTE MÊS`
  - `TOTAL A PAGAR PRÓXIMO MÊS`
  - `SALDO DEVEDOR FUTURO` (meses subsequentes)
  - `TOTAL GERAL CONTRATADO` (histórico geral de gastos)
  - `TOTAL Parcelado no Mês` vs `TOTAL À Vista no Mês`
- **Seletor de Período**: Navegação entre meses passados e futuros com recalculo automático.
- **Detalhamento de Compras & Parcelas do Mês**:
  - Tabela com: Comprador | Item / Compra | Data | Meio de Pagamento | Tipo | Parcela (ex: 2/5) | Valor da Parcela.
- **Resumo por Meio de Pagamento**:
  - Tabela com: Meio de Pagamento | Total no Mês | % do Total com barra de progresso visual.

### 2. 📋 Lançamentos Agrupados (`/lancamentos`)
- Visualização em tabela tradicional ou agrupada visualmente por **Dia** e **Loja**.
- Cards expansíveis com cabeçalho contendo total acumulado no dia e contagem de itens.
- Tabela detalhada com: Nome do Item, Comprador, Categoria, Quantidade formatada (com suporte a kg/gramas e decimais com vírgula), Valor Unitário, Valor Total, Meio de Pagamento, Tipo / Parcelas e Ações.
- Modal de cronograma completo de parcelas e datas de vencimento.
- Edição rápida e exclusão com modal de confirmação seguro.
- Campo de busca instantânea e filtro por mês de referência.

### 3. ➕ Adicionar Lançamento Multi-Item (`/lancamentos/novo`)
- Cabeçalho comum de compra: **Comprador**, **Loja / Estabelecimento**, **Data**, **Meio de Pagamento**, **Tipo** (À Vista / Parcelado) e **Número de Parcelas**.
- **Cards Dinâmicos de Itens**: Possibilidade de adicionar múltiplos itens adquiridos na mesma compra/recibo.
- Suporte a pesagens e **quantidades fracionadas/reais com vírgula** (ex: `0,350 kg` de pão, frios, carnes).
- Recálculo automático em tempo real entre Quantidade, Valor Unitário e Valor Total.
- **Simulação em Tempo Real**: Painel lateral projetando o cronograma de faturas e datas de vencimento respeitando a regra de fechamento do cartão.

### 4. 👥 Gestão de Compradores (`/compradores`)
- CRUD completo de pessoas/membros responsáveis pelas compras.
- Controle de status ativo/inativo e contagem de lançamentos vinculados.

### 5. 🏬 Lojas & Estabelecimentos (`/lojas`)
- Cadastro de estabelecimentos comerciais físicos e e-commerces.
- Vinculação com categoria de loja para relatórios e segmentação.

### 6. 💳 Meios de Pagamento & Regras de Fatura (`/meios-pagamento`)
- Gestão de cartões de crédito, débito, contas bancárias e dinheiro.
- Configuração de **Dia de Fechamento** e **Dia de Vencimento** da fatura.
- Regra inteligente: compras após o fechamento caem na fatura subsequente.

### 7. 🏷️ Categorias de Itens (`/admin/categorias-itens`)
- CRUD isolado de categorias de produtos e despesas.
- Identificadores visuais com paleta de cores oficial do Blue Fox Design System.

### 8. 🏢 Categorias de Lojas (`/admin/categorias-lojas`)
- Gestão de ramos comerciais (Supermercado, E-commerce, Farmácia, Restaurante, etc.).

### 9. ⚙️ Hub Administrativo & Perfil de Usuário (`/admin` e `/admin/usuario`)
- Painel central com card de perfil e atalhos rápidos para todos os módulos.
- Seleção de avatares corporativos do ecossistema Blue Fox.
- Estrutura pronta para vinculação de identidade unificada via Keycloak SSO (IAM).

---

## 🔧 Execução Local para Desenvolvimento (Sem Docker)

Caso queira rodar o projeto diretamente na máquina local:

### 1. Subir apenas o PostgreSQL:
```bash
docker compose up -d postgres
```

### 2. Executar o Backend (NestJS):
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```

### 3. Executar o Frontend (Angular):
```bash
cd frontend
npm install
npm run start
```
Acesse: `http://localhost:4200`.
