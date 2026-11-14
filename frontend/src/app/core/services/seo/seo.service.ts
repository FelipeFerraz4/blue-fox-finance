import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PublicPage, seoContent } from '../../content/seo';

export interface SeoData {
  title: string;
  description: string;
  /** Caminho a partir da raiz (ex.: "/about"); vira canonical e og:url absolutos */
  path: string;
  image?: string;
  keywords?: string;
  type?: string;
}

const SITE_NAME = 'Blue Fox Finance';
const SITE_URL = 'https://finance.bluefoxglobalgroup.com';
/** Imagem de compartilhamento 1200x630 em public/og-default.jpg */
const DEFAULT_IMAGE = '/og-default.jpg';
const NOINDEX = 'noindex, nofollow';

/**
 * Title, description, Open Graph, Twitter, canonical e JSON-LD (mesmo modelo do
 * SeoService do Blue Fox Global Group). Aplicado pela rota: páginas com
 * `data.seo` são indexadas; todas as outras (sistema interno, atrás do login)
 * recebem `noindex` e ficam sem canonical. Usa DOCUMENT, então funciona também
 * no prerender (etapa futura).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  /** Chamado uma vez pelo AppComponent. */
  init(): void {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      const page = this.deepest(this.router.routerState.snapshot.root).data['seo'] as PublicPage | undefined;
      if (page) {
        const content = seoContent[page];
        const path = page === 'home' ? '/' : `/${page}`;
        this.update({ ...content, path });
        this.setJsonLd(page === 'home' ? this.appJsonLd(content.description) : null);
      } else {
        this.noindex();
      }
    });
  }

  update(data: SeoData): void {
    const { title, description, path, image = DEFAULT_IMAGE, keywords, type = 'website' } = data;
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;
    const absoluteImage = /^https?:\/\//.test(image) ? image : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    if (keywords) this.meta.updateTag({ name: 'keywords', content: keywords });
    else this.meta.removeTag("name='keywords'");

    // Open Graph (WhatsApp, LinkedIn, Facebook) e Twitter exigem URL absoluta
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: absoluteImage });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: absoluteImage });

    this.setCanonical(url);
  }

  /** Páginas internas: fora do índice, sem canonical nem JSON-LD. */
  noindex(): void {
    this.title.setTitle(SITE_NAME);
    this.meta.updateTag({ name: 'robots', content: NOINDEX });
    this.setCanonical(null);
    this.setJsonLd(null);
  }

  private deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  private setCanonical(url: string | null): void {
    let link = this.document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /** Dados estruturados (schema.org) da página inicial; null remove. */
  private setJsonLd(data: object | null): void {
    const id = 'seo-jsonld';
    let script = this.document.getElementById(id);
    if (!data) {
      script?.remove();
      return;
    }
    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  private appJsonLd(description: string): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, Telegram',
      inLanguage: 'pt-BR',
      image: `${SITE_URL}${DEFAULT_IMAGE}`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      publisher: { '@type': 'Organization', name: 'Blue Fox Global Group', url: 'https://bluefoxglobalgroup.com' },
    };
  }
}
