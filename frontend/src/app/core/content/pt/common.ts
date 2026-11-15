/** Textos do cabeçalho e do rodapé das páginas públicas (PT). Mesma forma em `en/common.ts`. */
export const commonContent = {
  nav: { home: 'Início', about: 'Sobre', updates: 'Atualizações' },
  login: 'Login',
  loginLong: 'Fazer Login',
  loginTitle: 'Fazer login no sistema',
  menuOpen: 'Abrir menu de navegação',
  menuClose: 'Fechar menu',
  menuTitle: 'Navegação',
  mainNav: 'Navegação principal',
  language: 'Idioma',
  languageNames: { pt: 'Português', en: 'English' },
  logoAlt: 'Logo do BlueFox Finance',
  footerNav: 'Links do rodapé',
  copyright: '© 2026 Blue Fox Global Group • Todos os direitos reservados.',
  notFound: {
    title: 'Página não encontrada',
    text: 'O endereço que você abriu não existe ou mudou de lugar.',
    home: 'Voltar ao início',
    app: 'Ir para o sistema',
  },
};

export type CommonContent = typeof commonContent;
