/**
 * Página inicial (PT). A versão em inglês (`en/home.ts`) tem a mesma forma.
 * Campos `html` aceitam só marcação simples (<strong>) e vão para [innerHTML].
 */
export const homeContent = {
  seo: {
    title: 'Blue Fox Finance · Controle financeiro no site e no Telegram',
    description:
      'Controle seus gastos com parcelamentos calculados pelo fechamento do cartão, contas a pagar com alertas, dashboard interativo e lançamentos pelo Telegram. Gratuito, do ecossistema Blue Fox.',
    keywords:
      'controle financeiro, controle de gastos, finanças pessoais, parcelamento, fatura do cartão, contas a pagar, bot do Telegram, dashboard financeiro',
  },
  hero: {
    badge: 'ECOSSISTEMA BLUE FOX • GESTÃO INTELIGENTE DE GASTOS',
    title: 'Controle Financeiro de Alta Precisão,',
    highlight: 'no Site e no Telegram',
    subtitle:
      'Gerencie compras em lote, parcelamentos com cálculo automático pelo fechamento do cartão, contas a pagar e múltiplos compradores, e registre gastos conversando com o bot do Telegram.',
    secondary: 'Conhecer a Origem',
  },
  mockup: {
    previewLabel: 'Prévia do dashboard do BlueFox Finance',
    badge: 'VERSÃO ATIVA • v1.6',
    stats: [
      { label: 'Total de Despesas', value: 'R$ 14.850,20', sub: 'Mês de referência ativo' },
      { label: 'Itens & Lançamentos', value: '128 itens', sub: 'Compras categorizadas' },
      { label: 'Cálculo de Faturas', value: '100% exato', sub: 'Por dia de fechamento' },
      { label: 'Contas a Pagar', value: '3 a vencer', sub: 'Avisos de vencimento' },
    ],
    strip: [
      'Lançamentos em Lote com Múltiplos Itens',
      'Projeção Automática de Parcelas',
      'Categorias de Itens e Lojas Cadastradas',
      'Lançamentos pelo Telegram',
    ],
  },
  features: {
    badge: 'RECURSOS DISPONÍVEIS HOJE',
    title: 'O que o BlueFox Finance entrega',
    subtitle: 'Funcionalidades operacionais prontas para uso no controle diário de gastos pessoais e em equipe.',
    // Mesma ordem dos ícones em home.component.html
    items: [
      {
        name: 'Parcelamento por Fechamento',
        desc: 'Cálculo inteligente do mês de competência da fatura baseado no dia de fechamento do cartão de crédito, sem necessidade de ajuste manual.',
      },
      {
        name: 'Divisão por Compradores',
        desc: 'Identifique exatamente quem realizou cada despesa dentro de uma mesma compra ou fatura, simplificando cobranças e rateios familiares.',
      },
      {
        name: 'Catálogo de Lojas & Categorias',
        desc: 'Classificação em dois níveis: categorias de lojas (Supermercado, Farmácia, E-commerce) e de produtos, com cores customizáveis e cadastro rápido direto no lançamento.',
      },
      {
        name: 'Dashboard Interativo',
        desc: 'Painel com filtro cruzado: clique em um mês, categoria, loja ou comprador e todos os gráficos se ajustam. Inclui comparação com o ano anterior e compromissos futuros.',
      },
      {
        name: 'Contas a Pagar',
        desc: 'Contas mensais, anuais e avulsas com status de vencimento, avisos no menu e no dashboard, e confirmação do pagamento feito.',
      },
      {
        name: 'Bot do Telegram',
        desc: 'Registre gastos, consulte o resumo do mês, confirme pagamentos e cadastre lojas e categorias pelo chat. Tudo aparece na hora no site.',
      },
    ],
  },
  about: {
    badge: 'NOSSA HISTÓRIA & GOVERNANÇA',
    title: 'A Origem do BlueFox Finance',
    subtitle:
      'Desenvolvido internamente pelo Blue Fox Global Group para controle rigoroso de despesas, faturas e contas, e agora disponível para todos.',
    boxes: [
      {
        title: 'Criado para Governança do Grupo',
        html: 'Nasceu da necessidade concreta do <strong>Blue Fox Global Group</strong> de gerenciar faturas de múltiplos cartões corporativos, compras de diferentes membros e orçamento com exatidão matemática.',
      },
      {
        title: 'Abertura e Democratização',
        html: 'Com a comprovada eficiência do motor de cálculo e divisão por compradores, a plataforma foi disponibilizada para que famílias e parceiros externos usufruam da mesma tecnologia de gestão.',
      },
    ],
    cta: 'Conhecer a História Completa & o Papel do Blue Fox Global Group',
  },
  cta: {
    title: 'Acesse o Sistema',
    subtitle: 'Faça login para gerenciar suas despesas, cadastros e faturas.',
    updates: 'Ver Atualizações & Roadmap',
  },
};

export type HomeContent = typeof homeContent;
