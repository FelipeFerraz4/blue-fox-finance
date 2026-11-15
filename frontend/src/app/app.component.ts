import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/general/navbar/navbar.component';
import { SidebarComponent } from './shared/components/general/sidebar/sidebar.component';
import { SidebarService } from './core/services/sidebar/sidebar.service';
import { A11yToolbarComponent } from './shared/components/general/a11y-toolbar/a11y-toolbar.component';
import { ThemeService } from './core/services/theme/theme.service';
import { AccessibilityService } from './core/services/accessibility/accessibility.service';
import { SeoService } from './core/services/seo/seo.service';
import { TranslationService } from './core/services/translation/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, A11yToolbarComponent],
  template: `
    <!-- Layout Público (Home Landing Page) -->
    <ng-container *ngIf="isPublicPage">
      <router-outlet></router-outlet>
    </ng-container>

    <!-- Layout da Aplicação Interna (Dashboard, Despesas, Admin, etc.) -->
    <div *ngIf="!isPublicPage" class="app-layout">
      <!-- Barra Superior Fixa Completa (Full Width) -->
      <app-navbar></app-navbar>

      <!-- Corpo da Aplicação: Menu Lateral Interno + Conteúdo -->
      <div class="app-body">
        <!-- Menu Lateral Interno -->
        <app-sidebar></app-sidebar>

        <!-- Área Principal de Conteúdo (Alinhada à Esquerda) -->
        <main class="page-container">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Barra de acessibilidade (todas as páginas) -->
    <app-a11y-toolbar></app-a11y-toolbar>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-page);
    }

    app-navbar {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
    }

    .app-body {
      display: flex;
      flex: 1;
      position: relative;
    }

    .page-container {
      flex: 1;
      padding: 2rem 2.5rem;
      max-width: 1440px;
      margin: 0; /* Alinhado à esquerda junto ao menu lateral */
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1.25rem 1rem;
      }
    }
  `],
})
export class AppComponent implements OnInit {
  isPublicPage = false;

  constructor(
    public readonly sidebarService: SidebarService,
    private readonly router: Router,
    // Instanciados no início para aplicar tema/fonte/contraste e ouvir o tema do sistema
    _theme: ThemeService,
    _a11y: AccessibilityService,
    seo: SeoService,
    // Idioma das páginas públicas (pela URL) e o lang do <html>
    _translation: TranslationService,
  ) {
    this.updateLayoutState(this.router.url);
    // Meta tags por rota: públicas indexadas, internas com noindex
    seo.init();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLayoutState(event.urlAfterRedirects || event.url);
        // Reseta o scroll para o início da página ao navegar para uma nova rota
        if (typeof window === 'undefined') return;
        if (!event.urlAfterRedirects?.includes('#') && !event.url?.includes('#')) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      });
  }

  /** Rotas do sistema interno; fora delas (404) vale o layout público. */
  private isAppRoute(url: string): boolean {
    return /^\/(dashboard|expenses|bills|payment-methods|stores|buyers|admin|lancamentos|analytics|analises|contas|meios-pagamento|lojas|compradores)(\/|$)/.test(url);
  }

  private updateLayoutState(url: string): void {
    if (!url) {
      this.isPublicPage = true;
      return;
    }
    const cleanUrl = url.split('?')[0].split('#')[0];
    // Páginas públicas em /pt e /en, e as URLs antigas sem idioma (redirecionam)
    this.isPublicPage = /^\/?((pt|en)(\/(about|updates))?|home|about|updates)?\/?$/.test(cleanUrl) || !this.isAppRoute(cleanUrl);
  }
}
