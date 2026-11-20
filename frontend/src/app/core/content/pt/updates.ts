/** Página Atualizações (PT). A versão em inglês (`en/updates.ts`) tem a mesma forma. */
export interface FeatureItem {
  title: string;
  badge: string;
  badgeClass: 'success' | 'warning' | 'purple';
  description: string;
  details: string[];
}

export const updatesContent = {
  seo: {
    title: 'Atualizações do Blue Fox Finance',
    description:
      'O que já foi lançado e o que está em desenvolvimento no Blue Fox Finance: dashboard, contas a pagar, bot do Telegram, tema escuro e acessibilidade.',
  },
  hero: {
    badge: 'TRANSPARÊNCIA & EVOLUÇÃO',
    title: 'Atualizações & Roadmap do Sistema',
    subtitle:
      'Acompanhe em detalhes o que já está funcionando no Blue Fox Finance, o que estamos construindo neste momento e as novidades planejadas para o futuro.',
  },
  tabs: {
    label: 'Filtrar atualizações',
    all: 'Visão Geral',
    completed: 'Implementadas',
    progress: 'Em Desenvolvimento',
    future: 'Roadmap Futuro',
  },
  columns: {
    completed: {
      title: 'Disponível no Sistema',
      counter: 'recursos',
      desc: 'Funcionalidades totalmente operacionais e testadas na versão atual.',
    },
    progress: {
      title: 'Em Desenvolvimento',
      counter: 'em curso',
      desc: 'Itens em fase de codificação e arquitetura técnica ativa.',
    },
    future: {
      title: 'Planejado para o Futuro',
      counter: 'no roadmap',
      desc: 'Módulos mapeados na esteira de evolução contínua da Blue Fox.',
    },
  },
  completed: [
    {
      title: 'Bot do Telegram',
      badge: 'Lançado v1.6',
      badgeClass: 'success',
      description:
        'Registre gastos, consulte o mês, confirme pagamentos e faça cadastros conversando com o bot. Tudo aparece na hora no site.',
      details: [
        '/lancamento com os mesmos campos da tela Novo Lançamento',
        '/resumo, /contas e /ultimos para consultas rápidas',
        '/cadastrar lojas, compradores, meios, categorias e contas, inclusive no meio do lançamento',
      ],
    },
    {
      title: 'Gestão de Usuários',
      badge: 'Lançado v1.6',
      badgeClass: 'success',
      description:
        'Administradores do Finance criam novas contas pela tela Serviços → Usuários, com acesso pelo login único da Blue Fox.',
      details: [
        'Login pelo e-mail com senha temporária',
        'Troca de senha obrigatória no primeiro acesso',
        'Novos usuários começam com o papel de usuário do Finance',
      ],
    },
    {
      title: 'Dashboard Interativo com Filtro Cruzado',
      badge: 'Lançado v1.4',
      badgeClass: 'success',
      description:
        'Painel no estilo Power BI: clique em um mês, categoria, loja ou comprador e todos os gráficos se ajustam ao filtro.',
      details: [
        'Gastos pelo mês em que cada parcela é paga',
        'Comparação com o ano anterior e compromissos futuros',
        'Parcelamentos em aberto e contas do ano no mesmo painel',
      ],
    },
    {
      title: 'Contas a Pagar Recorrentes',
      badge: 'Lançado v1.3',
      badgeClass: 'success',
      description: 'Controle de contas mensais, anuais e avulsas, com status de vencimento e confirmação do pagamento feito.',
      details: [
        'Status: paga, atrasada, vence hoje e próxima',
        'Fatura do cartão calculada pela soma das parcelas do mês',
        'Avisos no menu e no topo do dashboard',
      ],
    },
    {
      title: 'Login Único Blue Fox (SSO) & Dados Isolados',
      badge: 'Lançado v1.2',
      badgeClass: 'success',
      description:
        'Acesso pelo provedor de identidade do Blue Fox Global Group, com os dados de cada usuário totalmente separados.',
      details: [
        'Autenticação OpenID Connect (Keycloak)',
        'Rotas e API protegidas por papéis',
        'Cada usuário vê apenas os próprios lançamentos e cadastros',
      ],
    },
    {
      title: 'Lançamentos, Faturas & Cadastros',
      badge: 'Lançado v1.0',
      badgeClass: 'success',
      description:
        'A base do sistema: compras com vários itens, parcelas calculadas pelo fechamento do cartão e cadastros que agilizam cada lançamento.',
      details: [
        'Uma compra com cabeçalho único e múltiplos itens',
        'Mês da fatura e parcelas calculados pelo dia de fechamento',
        'Compradores, lojas, categorias e padrões de lançamento',
      ],
    },
  ] as FeatureItem[],
  progress: [
    {
      title: 'Avisos Automáticos de Contas',
      badge: 'Em Andamento',
      badgeClass: 'warning',
      description: 'Lembretes diários de contas que vencem em breve ou estão atrasadas, sem precisar abrir o site.',
      details: [
        'Aviso antes do vencimento e no dia',
        'Envio pelo Telegram, com outros canais em estudo',
        'Sem avisos repetidos para a mesma conta',
      ],
    },
    {
      title: 'Idiomas & Formatos por País',
      badge: 'Em Andamento',
      badgeClass: 'warning',
      description: 'O site em português e inglês, com moeda, datas e números no formato do seu país.',
      details: [
        'Páginas públicas já disponíveis em português e inglês',
        'Sistema interno e bot do Telegram no idioma escolhido',
        'País define moeda e formato de data e número (ex.: R$ 1.234,56 ou $1,234.56)',
      ],
    },
  ] as FeatureItem[],
  future: [
    {
      title: 'Exportação de Relatórios (PDF & Excel/CSV)',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Geração de extratos mensais organizados para impressão, auditoria ou conferência offline.',
      details: [
        'Exportação detalhada de faturas e parcelamentos',
        'Planilha compatível com Excel e Google Sheets',
        'Filtros personalizados na exportação',
      ],
    },
    {
      title: 'Planejamento Orçamentário (Orçado vs. Real)',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Definição de metas de gastos por categoria para comparação com despesas reais executadas.',
      details: [
        'Teto de gastos por categoria de despesa',
        'Barra de progresso de consumo do orçamento',
        'Alertas de proximidade do teto',
      ],
    },
    {
      title: 'Multi-Moeda & Cotação em Tempo Real',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Lançamento de despesas em dólares (USD) ou euros (EUR) com conversão automática para BRL.',
      details: [
        'Cotação do dia da compra ou do fechamento',
        'Cálculo de taxas de câmbio e IOF para compras internacionais',
      ],
    },
    {
      title: 'Aplicativo Mobile PWA',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Instalação em smartphones Android e iOS direto pelo navegador.',
      details: ['Adição rápida de gastos direto na tela inicial do celular', 'Sincronização em segundo plano'],
    },
  ] as FeatureItem[],
  bottomCta: {
    title: 'Quer testar a versão em funcionamento?',
    subtitle: 'Acesse o ambiente operacional e confira as funcionalidades já disponíveis.',
    button: 'Fazer Login e Acessar',
  },
};

export type UpdatesContent = typeof updatesContent;
