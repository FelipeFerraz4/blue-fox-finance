import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
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

/** Idiomas das páginas públicas (o sistema interno ainda é só em português). */
export const LANGUAGES = ['pt', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];
export type PublicPage = 'home' | 'about' | 'updates';

/** Chave do localStorage com a escolha do visitante (a mesma da etapa do sistema interno). */
export const LANG_STORAGE_KEY = 'bf-lang';

/** Atributo `lang` do <html> e `og:locale` de cada idioma. */
export const LANGUAGE_TAGS: Record<Language, { html: string; og: string }> = {
  pt: { html: 'pt-BR', og: 'pt_BR' },
  en: { html: 'en', og: 'en_US' },
};

const DICTIONARY = {
  pt: { common: commonPt, home: homePt, about: aboutPt, updates: updatesPt },
  en: { common: commonEn, home: homeEn, about: aboutEn, updates: updatesEn },
} satisfies Record<Language, unknown>;

export const isLanguage = (value: unknown): value is Language => LANGUAGES.includes(value as Language);

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

/** Idioma (do 1º segmento da URL; pt se não houver) e página pública (`data.seo`) da rota atual. */
export function routeLanguage(router: Router): { lang: Language; page: PublicPage | null } {
  let route: ActivatedRouteSnapshot = router.routerState.snapshot.root;
  const first = route.firstChild?.url[0]?.path;
  while (route.firstChild) route = route.firstChild;
  return {
    lang: isLanguage(first) ? first : 'pt',
    page: (route.data['seo'] as PublicPage | undefined) ?? null,
  };
}

/**
 * Idioma das páginas públicas, sempre vindo da URL (`/pt/...`, `/en/...`), como no
 * Blue Fox Global Group. Mantém o `lang` do <html> em dia: rotas sem idioma (sistema
 * interno) ficam em pt-BR.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  /** Idioma da página atual (pt fora das páginas públicas). */
  readonly lang = signal<Language>('pt');
  /** Página pública atual (`data.seo` da rota), ou null no sistema interno. */
  readonly page = signal<PublicPage | null>(null);
  readonly content = computed(() => DICTIONARY[this.lang()]);

  constructor() {
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
    this.document.documentElement.lang = LANGUAGE_TAGS[lang].html;
  }
}
