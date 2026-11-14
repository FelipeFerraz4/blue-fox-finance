/**
 * Textos de SEO das páginas públicas (as internas ficam fora do Google).
 * Na etapa de tradução ganham a versão em inglês com a mesma forma (padrão do Global Group).
 */
export type PublicPage = 'home' | 'about' | 'updates';

export interface PageSeo {
  title: string;
  description: string;
  keywords?: string;
}

export const seoContent: Record<PublicPage, PageSeo> = {
  home: {
    title: 'Blue Fox Finance · Controle financeiro no site e no Telegram',
    description:
      'Controle seus gastos com parcelamentos calculados pelo fechamento do cartão, contas a pagar com alertas, dashboard interativo e lançamentos pelo Telegram. Gratuito, do ecossistema Blue Fox.',
    keywords:
      'controle financeiro, controle de gastos, finanças pessoais, parcelamento, fatura do cartão, contas a pagar, bot do Telegram, dashboard financeiro',
  },
  about: {
    title: 'Sobre o Blue Fox Finance',
    description:
      'Conheça o Blue Fox Finance: o sistema de controle financeiro do ecossistema Blue Fox, com login único, dados isolados por usuário e foco em acessibilidade.',
  },
  updates: {
    title: 'Atualizações do Blue Fox Finance',
    description:
      'O que já foi lançado e o que está em desenvolvimento no Blue Fox Finance: dashboard, contas a pagar, bot do Telegram, tema escuro e acessibilidade.',
  },
};
