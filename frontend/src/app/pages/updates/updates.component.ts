import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FeatureItem {
  title: string;
  badge: string;
  badgeClass: 'success' | 'warning' | 'purple';
  description: string;
  details: string[];
}

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="updates-wrapper">
      <!-- Header Flutuante Público (Consistente com a Home) -->
      <header class="public-header">
        <div class="header-container">
          <a routerLink="/" class="brand" (click)="closeMobileMenu()">
            <div class="logo-box">
              <img
                src="assets/logo.png"
                alt="BlueFox Finance Logo"
                class="brand-logo"
              />
            </div>
            <div class="brand-info">
              <span class="brand-title">BlueFox</span>
              <span class="brand-tag">Finance</span>
            </div>
          </a>

          <!-- Navegação Não Logada: APENAS Início, Sobre e Atualizações -->
          <nav class="public-nav">
            <a routerLink="/" class="nav-link">Início</a>
            <a routerLink="/about" class="nav-link">Sobre</a>
            <a routerLink="/updates" class="nav-link active">Atualizações</a>
          </nav>

          <!-- Ação Direita: APENAS o botão de Login levando para o dashboard -->
          <div class="header-actions">
            <a routerLink="/dashboard" class="btn-login-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Login</span>
            </a>

            <!-- Hambúrguer Mobile -->
            <button
              class="hamburger-btn"
              [class.open]="mobileMenuOpen"
              (click)="toggleMobileMenu()"
              aria-label="Abrir Menu de Navegação"
            >
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Gaveta Mobile -->
      <div *ngIf="mobileMenuOpen" class="mobile-backdrop" (click)="closeMobileMenu()"></div>
      <div class="mobile-drawer" [class.open]="mobileMenuOpen">
        <div class="mobile-drawer-header">
          <div class="brand">
            <div class="logo-box-sm">
              <img src="assets/logo.png" alt="BlueFox" class="brand-logo"/>
            </div>
            <div class="brand-info">
              <span class="brand-title-sm">BlueFox Finance</span>
              <span class="brand-tag-sm">Navegação</span>
            </div>
          </div>
          <button class="btn-drawer-close" (click)="closeMobileMenu()">✕</button>
        </div>

        <nav class="mobile-nav-links">
          <a routerLink="/" (click)="closeMobileMenu()" class="mobile-nav-item">
            <span>Início</span>
          </a>
          <a routerLink="/about" (click)="closeMobileMenu()" class="mobile-nav-item">
            <span>Sobre</span>
          </a>
          <a routerLink="/updates" (click)="closeMobileMenu()" class="mobile-nav-item active">
            <span>Atualizações</span>
          </a>
        </nav>

        <div class="mobile-drawer-footer">
          <a routerLink="/dashboard" (click)="closeMobileMenu()" class="btn-login-drawer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Fazer Login</span>
          </a>
        </div>
      </div>

      <!-- Conteúdo da Página de Atualizações -->
      <main class="updates-main">
        <div class="updates-hero">
          <div class="section-badge">TRANSPARÊNCIA & EVOLUÇÃO</div>
          <h1 class="page-title">Atualizações & Roadmap do Sistema</h1>
          <p class="page-subtitle">
            Acompanhe em detalhes o que já está funcionando no BlueFox Finance, o que estamos construindo neste momento e as novidades planejadas para o futuro.
          </p>
        </div>

        <!-- Seletor de visualização rápida -->
        <div class="category-tabs">
          <button
            type="button"
            class="tab-btn"
            [class.active]="selectedTab === 'all'"
            (click)="selectedTab = 'all'"
          >
            Visão Geral
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="selectedTab === 'completed'"
            (click)="selectedTab = 'completed'"
          >
            <span class="tab-dot dot-green"></span>
            Implementadas ({{ completedFeatures.length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="selectedTab === 'progress'"
            (click)="selectedTab = 'progress'"
          >
            <span class="tab-dot dot-amber"></span>
            Em Desenvolvimento ({{ inProgressFeatures.length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="selectedTab === 'future'"
            (click)="selectedTab = 'future'"
          >
            <span class="tab-dot dot-purple"></span>
            Roadmap Futuro ({{ futureFeatures.length }})
          </button>
        </div>

        <div class="columns-grid">
          <!-- Coluna 1: Implementadas -->
          <section
            *ngIf="selectedTab === 'all' || selectedTab === 'completed'"
            class="status-column"
          >
            <div class="column-header">
              <div class="col-title-wrap">
                <span class="status-indicator ind-green"></span>
                <h2 class="col-title">Disponível no Sistema</h2>
              </div>
              <span class="col-counter green">{{ completedFeatures.length }} recursos</span>
            </div>
            <p class="column-desc">Funcionalidades totalmente operacionais e testadas na versão atual.</p>

            <div class="cards-list">
              <div *ngFor="let item of completedFeatures" class="update-card completed">
                <div class="card-header">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <span class="badge" [ngClass]="item.badgeClass">{{ item.badge }}</span>
                </div>
                <p class="item-desc">{{ item.description }}</p>
                <ul class="item-details">
                  <li *ngFor="let det of item.details">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{{ det }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Coluna 2: Em Desenvolvimento -->
          <section
            *ngIf="selectedTab === 'all' || selectedTab === 'progress'"
            class="status-column"
          >
            <div class="column-header">
              <div class="col-title-wrap">
                <span class="status-indicator ind-amber"></span>
                <h2 class="col-title">Em Desenvolvimento</h2>
              </div>
              <span class="col-counter amber">{{ inProgressFeatures.length }} em curso</span>
            </div>
            <p class="column-desc">Itens em fase de codificação e arquitetura técnica ativa.</p>

            <div class="cards-list">
              <div *ngFor="let item of inProgressFeatures" class="update-card in-progress">
                <div class="card-header">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <span class="badge" [ngClass]="item.badgeClass">{{ item.badge }}</span>
                </div>
                <p class="item-desc">{{ item.description }}</p>
                <ul class="item-details">
                  <li *ngFor="let det of item.details">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{{ det }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Coluna 3: Futuro / Roadmap -->
          <section
            *ngIf="selectedTab === 'all' || selectedTab === 'future'"
            class="status-column"
          >
            <div class="column-header">
              <div class="col-title-wrap">
                <span class="status-indicator ind-purple"></span>
                <h2 class="col-title">Planejado para o Futuro</h2>
              </div>
              <span class="col-counter purple">{{ futureFeatures.length }} no roadmap</span>
            </div>
            <p class="column-desc">Módulos mapeados na esteira de evolução contínua da Blue Fox.</p>

            <div class="cards-list">
              <div *ngFor="let item of futureFeatures" class="update-card future">
                <div class="card-header">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <span class="badge" [ngClass]="item.badgeClass">{{ item.badge }}</span>
                </div>
                <p class="item-desc">{{ item.description }}</p>
                <ul class="item-details">
                  <li *ngFor="let det of item.details">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>{{ det }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <!-- Call to action discreto no final -->
        <div class="bottom-cta">
          <h3 class="bottom-cta-title">Quer testar a versão em funcionamento?</h3>
          <p class="bottom-cta-subtitle">Acesse o ambiente operacional e confira as funcionalidades já disponíveis.</p>
          <a routerLink="/dashboard" class="btn-login-hero">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Fazer Login e Acessar</span>
          </a>
        </div>
      </main>

      <!-- Rodapé Público -->
      <footer class="public-footer">
        <div class="footer-container">
          <div class="footer-brand">
            <div class="logo-box-mini">
              <img src="assets/logo.png" alt="Blue Fox Logo" class="brand-logo-mini"/>
            </div>
            <span class="footer-brand-name">BlueFox Finance</span>
          </div>

          <div class="footer-links">
            <a routerLink="/">Início</a>
            <a routerLink="/about">Sobre</a>
            <a routerLink="/updates">Atualizações</a>
            <a routerLink="/dashboard">Login</a>
          </div>

          <div class="footer-copy">
            &copy; 2026 Blue Fox Global Group &bull; Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      background: #080f24;
      color: #ffffff;
      font-family: var(--font-body, 'Inter', sans-serif);
      min-height: 100vh;
    }

    .updates-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header Flutuante Suspenso (idêntico ao padrão logado) */
    .public-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(11, 19, 43, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(56, 182, 255, 0.2);
      width: 100%;
      box-shadow: 0 4px 20px rgba(11, 19, 43, 0.35);
    }

    .header-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .logo-box {
      width: 40px;
      height: 40px;
      background: #ffffff;
      border-radius: 11px;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(56, 182, 255, 0.3);
      box-shadow: 0 0 16px rgba(56, 182, 255, 0.35);
    }

    .brand-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .brand-info {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .brand-tag {
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38b6ff;
    }

    /* Links: Início, Sobre e Atualizações */
    .public-nav {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-link {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    .nav-link.active {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.25) 0%, rgba(0, 74, 173, 0.45) 100%);
      border: 1px solid rgba(56, 182, 255, 0.4);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Botão de Login */
    .btn-login-header {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(56, 182, 255, 0.35);
      border-radius: 50px;
      color: #ffffff;
      padding: 0.45rem 1.2rem;
      font-size: 0.86rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-login-header:hover {
      background: rgba(56, 182, 255, 0.18);
      border-color: #38b6ff;
      box-shadow: 0 0 14px rgba(56, 182, 255, 0.35);
      transform: translateY(-1px);
    }

    .hamburger-btn {
      display: none;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(56, 182, 255, 0.2);
      border-radius: 8px;
      width: 40px;
      height: 40px;
      padding: 8px;
      cursor: pointer;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }

    .bar {
      width: 20px;
      height: 2px;
      background: #ffffff;
      border-radius: 2px;
    }

    /* Mobile Drawer */
    .mobile-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 19, 43, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1001;
    }

    .mobile-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 82vw;
      max-width: 320px;
      height: 100vh;
      background: #0b132b;
      border-left: 1px solid rgba(56, 182, 255, 0.2);
      z-index: 1002;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.25s ease;
    }

    .mobile-drawer.open {
      transform: translateX(0);
    }

    .mobile-drawer-header {
      padding: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .logo-box-sm {
      width: 32px;
      height: 32px;
      background: #ffffff;
      border-radius: 8px;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-title-sm {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }

    .brand-tag-sm {
      font-size: 0.65rem;
      color: #38b6ff;
    }

    .btn-drawer-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
    }

    .mobile-nav-links {
      flex: 1;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .mobile-nav-item {
      padding: 0.75rem 1rem;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
    }

    .mobile-nav-item.active {
      background: rgba(56, 182, 255, 0.15);
      color: #38b6ff;
    }

    .mobile-drawer-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-login-drawer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      padding: 0.75rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
    }

    /* Conteúdo Principal */
    .updates-main {
      max-width: 1280px;
      margin: 0 auto;
      padding: 3rem 1.5rem 5rem 1.5rem;
      width: 100%;
      box-sizing: border-box;
      flex: 1;
    }

    .updates-hero {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .section-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #38b6ff;
      margin-bottom: 0.65rem;
    }

    .page-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 2.6rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin: 0 0 0.85rem 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 1.05rem;
      color: #94a3b8;
      max-width: 720px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Abas de Filtro */
    .category-tabs {
      display: flex;
      justify-content: center;
      gap: 0.65rem;
      margin-bottom: 2.75rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      padding: 0.55rem 1.15rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .tab-btn.active {
      background: #004aad;
      color: #ffffff;
      border-color: #38b6ff;
      box-shadow: 0 2px 12px rgba(56, 182, 255, 0.25);
    }

    .tab-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .dot-green { background: #10b981; }
    .dot-amber { background: #f59e0b; }
    .dot-purple { background: #a855f7; }

    /* Grid de Colunas */
    .columns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      align-items: start;
    }

    .status-column {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 18px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .col-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .ind-green { background: #10b981; box-shadow: 0 0 8px #10b981; }
    .ind-amber { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .ind-purple { background: #a855f7; box-shadow: 0 0 8px #a855f7; }

    .col-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .col-counter {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 50px;
      text-transform: uppercase;
    }

    .col-counter.green {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .col-counter.amber {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .col-counter.purple {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .column-desc {
      font-size: 0.82rem;
      color: #64748b;
      margin: -0.5rem 0 0 0;
      line-height: 1.4;
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .update-card {
      background: rgba(11, 19, 43, 0.8);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.2s ease;
    }

    .update-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .update-card.completed {
      border-left: 3px solid #10b981;
    }

    .update-card.in-progress {
      border-left: 3px solid #f59e0b;
    }

    .update-card.future {
      border-left: 3px solid #a855f7;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .item-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
    }

    .badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 50px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge.success {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge.warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge.purple {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .item-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .item-details {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 0.65rem;
    }

    .item-details li {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: #cbd5e1;
    }

    /* Bottom CTA */
    .bottom-cta {
      margin-top: 4.5rem;
      background: linear-gradient(135deg, rgba(0, 74, 173, 0.25) 0%, rgba(11, 19, 43, 0.6) 100%);
      border: 1px solid rgba(56, 182, 255, 0.25);
      border-radius: 20px;
      padding: 2.75rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
    }

    .bottom-cta-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.8rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .bottom-cta-subtitle {
      font-size: 0.95rem;
      color: #94a3b8;
      max-width: 580px;
      margin: 0 0 1rem 0;
    }

    .btn-login-hero {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      padding: 0.8rem 2.2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 4px 20px rgba(56, 182, 255, 0.4);
      transition: all 0.2s ease;
    }

    .btn-login-hero:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(56, 182, 255, 0.6);
    }

    /* Footer */
    .public-footer {
      background: #060b19;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 2.5rem 1.5rem;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .logo-box-mini {
      width: 28px;
      height: 28px;
      background: #ffffff;
      border-radius: 7px;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-logo-mini {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .footer-brand-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-weight: 700;
      font-size: 1.05rem;
      color: #ffffff;
    }

    .footer-links {
      display: flex;
      gap: 1.5rem;
    }

    .footer-links a {
      color: #64748b;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: #38b6ff;
    }

    .footer-copy {
      font-size: 0.8rem;
      color: #475569;
    }

    @media (max-width: 768px) {
      .public-nav { display: none; }
      .hamburger-btn { display: flex; }
      .page-title { font-size: 1.9rem; }
      .columns-grid { grid-template-columns: 1fr; }
      .footer-container {
        flex-direction: column;
        text-align: center;
      }
    }
  `],
})
export class UpdatesComponent {
  mobileMenuOpen = false;
  selectedTab: 'all' | 'completed' | 'progress' | 'future' = 'all';

  completedFeatures: FeatureItem[] = [
    {
      title: 'Lançamentos Agrupados & Múltiplos Itens',
      badge: 'Lançado v1.0',
      badgeClass: 'success',
      description: 'Permite registrar uma compra com um único cabeçalho (comprador, loja, data) e múltiplos itens detalhados com valores individuais.',
      details: [
        'Adição dinâmica de linhas de produtos',
        'Cálculo automático do valor total da compra',
        'Associação de cada item à sua categoria específica',
      ],
    },
    {
      title: 'Cálculo Inteligente de Faturas de Cartão',
      badge: 'Lançado v1.0',
      badgeClass: 'success',
      description: 'Determina automaticamente o mês de vencimento da fatura com base no dia de fechamento do cartão de crédito cadastrado.',
      details: [
        'Divisão automática de compras parceladas',
        'Projeção de parcelas mês a mês',
        'Precisão para compras realizadas antes ou após o fechamento',
      ],
    },
    {
      title: 'Controle de Múltiplos Compradores',
      badge: 'Lançado v1.0',
      badgeClass: 'success',
      description: 'Gestão de múltiplos responsáveis por despesas, ideal para famílias ou grupos de compras.',
      details: [
        'Cadastro centralizado de compradores',
        'Filtro e agrupamento de despesas por comprador',
        'Identificação de compras coletivas e rateio',
      ],
    },
    {
      title: 'Categorização Dupla: Itens & Lojas',
      badge: 'Lançado v1.0',
      badgeClass: 'success',
      description: 'Estrutura em dois níveis para organização máxima: tipos de produtos e categorias de estabelecimentos.',
      details: [
        'Cores personalizadas por categoria',
        'Associação de loja com segmento comercial',
        'Filtros rápidos na lista de despesas',
      ],
    },
    {
      title: 'Dashboard Analítico & Indicadores',
      badge: 'Lançado v1.0',
      badgeClass: 'success',
      description: 'Visão consolidada das finanças do mês com métricas, despesas por categoria e resumo de meios de pagamento.',
      details: [
        'Totalizador financeiro do mês corrente',
        'Visualização de faturas a vencer',
        'Navegação entre meses de competência',
      ],
    },
    {
      title: 'Central de Administração & Perfil de Usuário',
      badge: 'Lançado v1.1',
      badgeClass: 'success',
      description: 'Hub administrativo com atalhos operacionais rápidos e seleção de avatares oficiais Blue Fox.',
      details: [
        'Edição de dados de perfil do usuário',
        'Avatares temáticos do ecossistema Blue Fox',
        'Hub visual para gerenciar lojas, compradores e categorias',
      ],
    },
  ];

  inProgressFeatures: FeatureItem[] = [
    {
      title: 'Integração com Keycloak SSO (IAM)',
      badge: 'Em Andamento',
      badgeClass: 'warning',
      description: 'Estruturação do provedor de identidade do Blue Fox Global Group para login federado corporativo.',
      details: [
        'Autenticação OpenID Connect e OAuth2',
        'Proteção de rotas internas com Guards de segurança',
        'Single Sign-On unificado para os sistemas do grupo',
      ],
    },
    {
      title: 'Exportação de Relatórios (PDF & Excel/CSV)',
      badge: 'Em Andamento',
      badgeClass: 'warning',
      description: 'Geração de extratos mensais organizados para impressão, auditoria ou conferência offline.',
      details: [
        'Exportação detalhada de faturas e parcelamentos',
        'Planilha compatível com Excel e Google Sheets',
        'Filtros personalizados na exportação',
      ],
    },
    {
      title: 'Planejamento Orçamentário (Orçado vs. Real)',
      badge: 'Em Andamento',
      badgeClass: 'warning',
      description: 'Definição de metas de gastos por categoria para comparação com despesas reais executadas.',
      details: [
        'Teto de gastos por categoria de despesa',
        'Barra de progresso de consumo do orçamento',
        'Alertas visuais de proximidade do teto',
      ],
    },
  ];

  futureFeatures: FeatureItem[] = [
    {
      title: 'Leitura de Comprovantes via OCR & IA',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Envio de foto ou PDF de notas fiscais com preenchimento automático de itens e valores por IA.',
      details: [
        'Extração automática de loja, data e itens',
        'Sugestão de categorias com base no nome do produto',
        'Agilidade máxima para registro de compras físicas',
      ],
    },
    {
      title: 'Alertas Automáticos & Notificações',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Avisos preventivos de vencimento de faturas e alertas de estouro de orçamento por e-mail e webhook.',
      details: [
        'Notificação antes do fechamento e vencimento de cartões',
        'Alertas configuráveis por limite de gastos',
        'Integração via Telegram / WhatsApp / Webhook',
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
      description: 'Instalação nativa em smartphones Android e iOS com funcionamento offline.',
      details: [
        'Adição rápida de gastos direto na tela inicial do celular',
        'Sincronização em segundo plano',
      ],
    },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
