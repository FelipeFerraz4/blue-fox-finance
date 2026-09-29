import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoticeModalComponent } from '../notice-modal/notice-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NoticeModalComponent],
  template: `
    <header class="navbar">
      <div class="navbar-container">
        <!-- Brand & Logo Oficial Blue Fox -->
        <a routerLink="/dashboard" class="brand" (click)="closeMobileMenu()">
          <div class="logo-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">BlueFox</span>
            <span class="brand-subtitle">Spend & Finance</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-links desktop-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
            Dashboard
          </a>

          <a routerLink="/lancamentos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Lançamentos
          </a>

          <a routerLink="/meios-pagamento" routerLinkActive="active" class="nav-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            Meios de Pagamento
          </a>

          <a routerLink="/lojas" routerLinkActive="active" class="nav-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Lojas
          </a>

          <a routerLink="/compradores" routerLinkActive="active" class="nav-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Compradores
          </a>
        </nav>

        <!-- Right Actions: Novo Lançamento + Botão Login à Direita -->
        <div class="navbar-actions">
          <a routerLink="/lancamentos/novo" class="btn btn-primary btn-sm btn-pill cta-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Novo Lançamento</span>
          </a>

          <!-- Botão de Login no fim do lado direito do Header -->
          <button
            type="button"
            class="btn-login-header"
            (click)="openLoginNotice()"
            title="Acessar com Keycloak SSO"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span>Login</span>
          </button>

          <!-- Hamburger Button (Mobile Only) -->
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

      <!-- Backdrop Overlay para Mobile -->
      <div *ngIf="mobileMenuOpen" class="mobile-backdrop" (click)="closeMobileMenu()"></div>

      <!-- Gaveta de Navegação Mobile (Drawer) -->
      <div class="mobile-drawer" [class.open]="mobileMenuOpen">
        <div class="mobile-drawer-header">
          <div class="brand">
            <div class="logo-box-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-title-sm">BlueFox Spend</span>
              <span class="brand-subtitle-sm">Navegação</span>
            </div>
          </div>
          <button class="btn-drawer-close" (click)="closeMobileMenu()">✕</button>
        </div>

        <nav class="mobile-nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="9"/>
                <rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/>
                <rect x="3" y="16" width="7" height="5"/>
              </svg>
            </div>
            <span>Dashboard</span>
          </a>

          <a routerLink="/lancamentos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span>Lançamentos</span>
          </a>

          <a routerLink="/meios-pagamento" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <span>Meios de Pagamento</span>
          </a>

          <a routerLink="/lojas" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Lojas</span>
          </a>

          <a routerLink="/compradores" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span>Compradores</span>
          </a>
        </nav>

        <div class="mobile-drawer-footer">
          <button (click)="openLoginNotice(); closeMobileMenu()" class="btn btn-outline-light btn-pill full-width mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login SSO
          </button>
          <a routerLink="/lancamentos/novo" (click)="closeMobileMenu()" class="btn btn-primary btn-pill full-width">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Lançamento
          </a>
        </div>
      </div>

      <!-- Reusable Notice Modal para Keycloak Login -->
      <app-notice-modal
        [isOpen]="loginModalOpen"
        title="Autenticação BlueFox"
        badge="Keycloak SSO"
        message="O sistema de login corporativo com Keycloak SSO está em fase de implementação."
        details="Futuramente, o login será integrado diretamente ao Keycloak Identity Provider (IAM), com suporte a Single Sign-On (SSO) unificado e permissões por perfil."
        type="keycloak"
        confirmText="Entendi"
        (close)="loginModalOpen = false"
      ></app-notice-modal>
    </header>
  `,
  styles: [`
    .navbar {
      background: #0b132b; /* Navy Oficial Blue Fox */
      border-bottom: 1px solid rgba(56, 182, 255, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
      color: #ffffff;
      box-shadow: 0 4px 20px rgba(11, 19, 43, 0.35);
    }

    .navbar-container {
      max-width: 1440px;
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
      user-select: none;
    }

    .logo-box {
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px rgba(56, 182, 255, 0.35);
      transition: transform 0.2s ease;
    }

    .brand:hover .logo-box {
      transform: scale(1.05);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
      color: #ffffff;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.68rem;
      font-weight: 600;
      color: #38b6ff;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.85rem;
      color: #94a3b8;
      text-decoration: none;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    .nav-item.active {
      color: #ffffff;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      box-shadow: 0 2px 10px rgba(56, 182, 255, 0.3);
      font-weight: 600;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .cta-btn {
      font-size: 0.85rem;
      padding: 0.45rem 1.15rem;
    }

    /* Botão de Login no fim do Header */
    .btn-login-header {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(56, 182, 255, 0.35);
      border-radius: 50px;
      color: #ffffff;
      padding: 0.45rem 1.1rem;
      font-family: var(--font-inter), sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-login-header:hover {
      background: rgba(56, 182, 255, 0.18);
      border-color: #38b6ff;
      box-shadow: 0 0 12px rgba(56, 182, 255, 0.3);
      transform: translateY(-1px);
    }

    /* Botão Hambúrguer Mobile */
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
      transition: all 0.2s ease;
    }

    .hamburger-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: #38b6ff;
    }

    .bar {
      width: 20px;
      height: 2px;
      background-color: #ffffff;
      border-radius: 2px;
      transition: all 0.25s ease;
    }

    .hamburger-btn.open .bar:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }

    .hamburger-btn.open .bar:nth-child(2) {
      opacity: 0;
    }

    .hamburger-btn.open .bar:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }

    /* Mobile Backdrop */
    .mobile-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(11, 19, 43, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1001;
      animation: fadeIn 0.2s ease-out;
    }

    /* Mobile Drawer */
    .mobile-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 82vw;
      max-width: 320px;
      height: 100vh;
      background: #0b132b;
      border-left: 1px solid rgba(56, 182, 255, 0.2);
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      z-index: 1002;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .mobile-drawer.open {
      transform: translateX(0);
    }

    .mobile-drawer-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .logo-box-sm {
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-title-sm {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-weight: 700;
      font-size: 1.05rem;
      color: #ffffff;
    }

    .brand-subtitle-sm {
      font-size: 0.65rem;
      color: #38b6ff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .btn-drawer-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.35rem;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
    }

    .mobile-nav-links {
      flex: 1;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
    }

    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      color: #cbd5e1;
      text-decoration: none;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 10px;
      transition: all 0.15s ease;
    }

    .mobile-nav-item .icon-wrap {
      color: #38b6ff;
      display: flex;
      align-items: center;
    }

    .mobile-nav-item:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
    }

    .mobile-nav-item.active {
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.2) 0%, rgba(0, 74, 173, 0.3) 100%);
      color: #ffffff;
      border: 1px solid rgba(56, 182, 255, 0.35);
      font-weight: 600;
    }

    .mobile-drawer-footer {
      padding: 1.25rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .full-width {
      width: 100%;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .navbar-container {
        padding: 0.75rem 1rem;
      }

      .desktop-nav {
        display: none;
      }

      .hamburger-btn {
        display: flex;
      }

      .btn-login-header span {
        display: none;
      }

      .btn-login-header {
        padding: 0.45rem;
        border-radius: 8px;
      }

      .cta-btn span {
        display: none;
      }

      .cta-btn {
        padding: 0.5rem 0.65rem;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
})
export class NavbarComponent {
  mobileMenuOpen = false;
  loginModalOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  openLoginNotice() {
    this.loginModalOpen = true;
  }
}
