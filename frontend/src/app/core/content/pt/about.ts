/**
 * Página Sobre (PT). A versão em inglês (`en/about.ts`) tem a mesma forma.
 * Campos `html` aceitam só marcação simples (<strong>) e vão para [innerHTML].
 */
export const aboutContent = {
  seo: {
    title: 'Sobre o Blue Fox Finance',
    description:
      'Conheça o Blue Fox Finance: o sistema de controle financeiro do ecossistema Blue Fox, com login único, dados isolados por usuário e foco em acessibilidade.',
  },
  hero: {
    badge: 'HISTÓRIA & GOVERNANÇA CORPORATIVA',
    title: 'Sobre o Blue Fox Finance',
    html: 'Como uma solução desenvolvida internamente para resolver os desafios de orçamento e gastos do <strong>Blue Fox Global Group</strong> evoluiu para uma plataforma aberta de controle financeiro de alta precisão.',
  },
  foundation: {
    tag: 'A FUNDAÇÃO',
    title: 'Por que o sistema foi criado?',
    paragraphs: [
      'O <strong>Blue Fox Finance</strong> surgiu no seio das operações internas do <strong>Blue Fox Global Group</strong> para resolver uma dor concreta e urgente de governança corporativa: o controle rigoroso de fluxo de despesas, faturamento e previsibilidade de orçamento entre diversas frentes e projetos.',
      'Com múltiplos cartões corporativos, diferentes dias de fechamento e vencimento de faturas, e despesas realizadas por vários membros da equipe, métodos manuais como planilhas geravam ruídos constantes: parcelas atribuídas ao mês errado, compras sem rastreabilidade de comprador e falta de clareza sobre o impacto no fluxo de caixa futuro.',
    ],
    highlight:
      'Solução: Criar um algoritmo matemático que calculasse a competência exata de cada compra com base no dia de fechamento do cartão e registrasse lançamentos em lote com múltiplos itens.',
  },
  opening: {
    tag: 'EXPANSÃO & DEMOCRATIZAÇÃO',
    title: 'A Abertura para o Público',
    paragraphs: [
      'À medida que a ferramenta amadureceu e seu uso diário trouxe tranquilidade orçamentária e previsibilidade total aos gestores do grupo, ficou evidente que essa mesma dificuldade é enfrentada diariamente por famílias, pequenas empresas, parceiros e profissionais independentes.',
      'Decidiu-se então desvincular a aplicação de amarras estritamente internas e disponibilizá-la publicamente. A plataforma foi lapidada com interface limpa, categorização em dois níveis (itens e estabelecimentos), divisão por compradores e painel analítico com os padrões do Blue Fox Design System.',
    ],
    highlight:
      'Objetivo: Proporcionar a qualquer usuário o mesmo nível de controle e governança antes acessível apenas às operações internas corporativas.',
  },
  holding: {
    tag: 'A HOLDING MANTENEDORA',
    title: 'O que é o Blue Fox Global Group?',
    html: 'O <strong>Blue Fox Global Group</strong> é o grupo holding que desenvolve, gerencia e investe em ecossistemas de tecnologia, inovação financeira, soluções de infraestrutura e iniciativas multissetoriais. O grupo atua sob pilares rigorosos de segurança da informação, eficiência operacional e excelência em engenharia de software.',
    pillars: [
      { label: 'Finanças & Governança', desc: 'Plataformas de gestão orçamentária e previsibilidade matemática de gastos.' },
      { label: 'Infraestrutura & Nuvem', desc: 'Arquitetura de contêineres resilientes, alta disponibilidade e segurança Zero-Trust.' },
      { label: 'Design & Experiência', desc: 'Padronização visual elegante por meio do Blue Fox Design System.' },
    ],
  },
  identity: {
    tag: 'INFRAESTRUTURA & IDENTIDADE',
    title: 'O Papel do Grupo no Sistema & o Login Único com Keycloak',
    html: 'No <strong>Blue Fox Finance</strong>, o papel do <strong>Blue Fox Global Group</strong> é atuar como provedor de infraestrutura, custodiante das boas práticas de engenharia e guardião da segurança dos dados.',
    panelBadge: 'Segurança Corporativa',
    panelTitle: 'Por que o Keycloak?',
    panelHtml:
      'O acesso ao sistema passa pela camada de autenticação centralizada do Blue Fox Global Group, construída sobre o <strong>Keycloak Identity & Access Management (IAM)</strong>.',
    points: [
      { title: 'Single Sign-On (SSO):', text: 'Acesso único e unificado para os múltiplos produtos e ferramentas do ecossistema Blue Fox.' },
      {
        title: 'Protocolos OpenID Connect & OAuth2:',
        text: 'Padrão global da indústria para troca segura de tokens criptografados e proteção de sessões.',
      },
      {
        title: 'Controle de Perfis (RBAC):',
        text: 'Gestão granular de permissões e isolamento completo de registros por usuário e organização.',
      },
    ],
    footnote: 'O botão de Login leva ao login único da Blue Fox: a mesma conta vale para todos os produtos do ecossistema.',
  },
  cta: {
    title: 'Acesse o Blue Fox Finance',
    subtitle: 'Faça login para navegar pela ferramenta e gerenciar seus lançamentos, cartões e orçamentos.',
    updates: 'Ver Atualizações & Roadmap',
  },
};

export type AboutContent = typeof aboutContent;
