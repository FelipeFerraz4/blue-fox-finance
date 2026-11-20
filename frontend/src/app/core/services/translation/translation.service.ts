import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, ResolveEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { storageGet, storageSet } from '../../utils/browser-storage';

import { commonContent as commonPt } from '../../content/pt/common';
import { homeContent as homePt } from '../../content/pt/home';
import { aboutContent as aboutPt } from '../../content/pt/about';
import { updatesContent as updatesPt } from '../../content/pt/updates';
import { commonContent as commonEn } from '../../content/en/common';
import { homeContent as homeEn } from '../../content/en/home';
import { aboutContent as aboutEn } from '../../content/en/about';
import { updatesContent as updatesEn } from '../../content/en/updates';

import { LANGUAGES, LANG_STORAGE_KEY, Language, isLanguage } from '../../i18n/locale';
import { PREFERRED_LANGUAGE, activeLanguage } from '../../i18n/i18n';

export { LANGUAGES, isLanguage };
export type { Language };
export type PublicPage = 'home' | 'about' | 'updates';

/** Atributo `lang` do <html> e `og:locale` de cada idioma. */
export const LANGUAGE_TAGS: Record<Language, { html: string; og: string }> = {
  pt: { html: 'pt-BR', og: 'pt_BR' },
  en: { html: 'en', og: 'en_US' },
};

const DICTIONARY = {
  pt: { common: commonPt, home: homePt, about: aboutPt, updates: updatesPt },
  en: { common: commonEn, home: homeEn, about: aboutEn, updates: updatesEn },
} satisfies Record<Language, unknown>;


/** Caminho de uma página pública num idioma: `/pt`, `/en/about`... */
export function publicPath(lang: Language, page: PublicPage): string {
  return page === 'home' ? `/${lang}` : `/${lang}/${page}`;
}

/**
 * Idioma para as URLs sem idioma (`/`, `/about`, links antigos): a escolha salva;
 * sem escolha, o idioma do navegador (português → pt, qualquer outro → en).
 * Robôs sem localStorage e com navegador em inglês caem em /en, e o x-default é /pt.
 * Usado nos `redirectTo` das rotas (contexto de injeção).
 */
export function preferredLanguage(): Language {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return 'pt';
  const saved = storageGet(LANG_STORAGE_KEY);
  if (isLanguage(saved)) return saved;
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

/** Idioma (do 1º segmento da URL; sem ele, o preferido do usuário) e página pública (`data.seo`) da rota atual. */
export function routeLanguage(router: Router, root?: ActivatedRouteSnapshot): { lang: Language; page: PublicPage | null } {
  let route: ActivatedRouteSnapshot = root ?? router.routerState.snapshot.root;
  const first = route.firstChild?.url[0]?.path;
  while (route.firstChild) route = route.firstChild;
  return {
    lang: isLanguage(first) ? first : PREFERRED_LANGUAGE,
    page: (route.data['seo'] as PublicPage | undefined) ?? null,
  };
}

/**
 * Idioma das páginas públicas, sempre vindo da URL (`/pt/...`, `/en/...`), como no
 * Blue Fox Global Group; no sistema interno (sem idioma na URL), o preferido do
 * usuário. Atualiza o `activeLanguage` do `t()` e o `lang` do <html>.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  /** Idioma da página atual (o preferido fora das páginas públicas). */
  readonly lang = signal<Language>('pt');
  /** Página pública atual (`data.seo` da rota), ou null no sistema interno. */
  readonly page = signal<PublicPage | null>(null);
  readonly content = computed(() => DICTIONARY[this.lang()]);

  constructor() {
    if (typeof window !== 'undefined') {
      const firstSeg = window.location.pathname.split('/').filter(Boolean)[0];
      const initialLang = isLanguage(firstSeg) ? firstSeg : PREFERRED_LANGUAGE;
      this.lang.set(initialLang);
      activeLanguage.set(initialLang);
    }
    // Idioma em uso trocado antes de criar os componentes da nova rota (ResolveEnd), para
    // textos montados no construtor (t()) já saírem no idioma certo
    this.router.events.pipe(filter((e): e is ResolveEnd => e instanceof ResolveEnd)).subscribe((e) => {
      activeLanguage.set(routeLanguage(this.router, e.state.root).lang);
    });
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => this.sync());
  }

  /** Textos de um idioma (o SeoService lê pelo idioma da rota). */
  contentFor(lang: Language) {
    return DICTIONARY[lang];
  }

  /** Caminho de uma página pública no idioma atual. */
  path(page: PublicPage): string {
    return publicPath(this.lang(), page);
  }

  /** Mesma página pública em outro idioma (para o seletor PT | EN). */
  pathIn(lang: Language): string {
    return publicPath(lang, this.page() ?? 'home');
  }

  /** Guarda a escolha, usada pelas URLs sem idioma (`/`, links antigos). */
  remember(lang: Language): void {
    storageSet(LANG_STORAGE_KEY, lang);
  }

  private sync(): void {
    const { lang, page } = routeLanguage(this.router);
    this.lang.set(lang);
    this.page.set(page);
    activeLanguage.set(lang);
    this.document.documentElement.lang = LANGUAGE_TAGS[lang].html;
  }
}
