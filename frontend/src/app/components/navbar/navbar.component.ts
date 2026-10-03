import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NoticeModalComponent } from '../notice-modal/notice-modal.component';
import { UserService, UserProfile, SystemAvatar } from '../../services/user.service';

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
            <span class="brand-subtitle">Finance</span>
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

          <a routerLink="/admin" routerLinkActive="active" class="nav-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Admin
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
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
        <!-- Topo da Gaveta Mobile -->
        <div class="mobile-drawer-header">
          <div class="brand">
            <div class="logo-box-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-title-sm">BlueFox Finance</span>
              <span class="brand-subtitle-sm">Navegação & Gestão</span>
            </div>
          </div>
          <button class="btn-drawer-close" (click)="closeMobileMenu()" aria-label="Fechar Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Card de Usuário / Perfil Rápido -->
        <div class="drawer-user-section">
          <a routerLink="/admin/usuario" (click)="closeMobileMenu()" class="drawer-user-card" title="Ver perfil e configurações">
            <div
              class="user-avatar-mini"
              [style.background]="'linear-gradient(135deg, ' + currentAvatar.color + ' 0%, #0b132b 100%)'"
            >
              <svg *ngIf="currentAvatar.iconType === 'fox-blue'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-cyan'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-shield'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-star'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-bolt'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-chart'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span class="user-status-dot"></span>
            </div>

            <div class="user-info-text">
              <span class="user-name">{{ profile.name }}</span>
              <span class="user-role">{{ profile.role }}</span>
            </div>

            <div class="user-arrow">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </a>
        </div>

        <!-- Links de Navegação Agrupados -->
        <nav class="mobile-nav-links">
          <!-- SEÇÃO 1: PRINCIPAL -->
          <div class="drawer-section-label">Principal</div>

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

          <!-- SEÇÃO 2: CADASTROS BASE -->
          <div class="drawer-section-label">Cadastros Base</div>

          <a routerLink="/compradores" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span>Compradores</span>
          </a>

          <a routerLink="/lojas" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Lojas & Estabelecimentos</span>
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

          <a routerLink="/admin/categorias-itens" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <span>Categorias de Itens</span>
          </a>

          <a routerLink="/admin/categorias-lojas" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Categorias de Lojas</span>
          </a>

          <!-- SEÇÃO 3: ADMINISTRAÇÃO & HUB (DESTAQUE MOBILE) -->
          <div class="drawer-section-label">Administração</div>

          <a
            routerLink="/admin"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{exact: true}"
            (click)="closeMobileMenu()"
            class="mobile-nav-item admin-nav-item"
          >
            <div class="icon-wrap admin-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div class="nav-text-container">
              <span>Central de Admin</span>
              <span class="badge-hub">Hub</span>
            </div>
          </a>

          <a routerLink="/admin/usuario" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item">
            <div class="icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span>Perfil do Usuário</span>
          </a>
        </nav>

        <!-- Rodapé da Gaveta Mobile com Ações Rápidas -->
        <div class="mobile-drawer-footer">
          <a routerLink="/lancamentos/novo" (click)="closeMobileMenu()" class="btn btn-primary btn-pill full-width mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Novo Lançamento</span>
          </a>

          <button (click)="openLoginNotice(); closeMobileMenu()" class="btn btn-outline-light btn-pill full-width mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Login SSO (Keycloak)</span>
          </button>

          <div class="mobile-drawer-brand-footnote">
            BlueFox Finance &bull; Hub Administrativo
          </div>
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
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
    }

    .navbar {
      background: rgba(11, 19, 43, 0.96); /* Navy Oficial Blue Fox com acabamento suspenso */
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(56, 182, 255, 0.2);
      width: 100%;
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
      width: 86vw;
      max-width: 340px;
      height: 100vh;
      background: #0b132b;
      border-left: 1px solid rgba(56, 182, 255, 0.2);
      box-shadow: none;
      z-index: 1002;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                  visibility 0.28s,
                  box-shadow 0.28s ease;
    }

    .mobile-drawer.open {
      transform: translateX(0);
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.65);
      visibility: visible;
      pointer-events: auto;
    }

    @media (min-width: 769px) {
      .mobile-drawer,
      .mobile-backdrop {
        display: none !important;
      }
    }

    .mobile-drawer-header {
      padding: 1.1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(11, 19, 43, 0.95);
    }

    .logo-box-sm {
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(56, 182, 255, 0.3);
    }

    .brand-title-sm {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-weight: 700;
      font-size: 1.05rem;
      color: #ffffff;
      line-height: 1.1;
    }

    .brand-subtitle-sm {
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.65rem;
      color: #38b6ff;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .btn-drawer-close {
      width: 34px;
      height: 34px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-drawer-close:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border-color: #38b6ff;
    }

    /* Card de Usuário / Perfil Rápido no Drawer */
    .drawer-user-section {
      padding: 0.85rem 1rem 0.35rem 1rem;
    }

    .drawer-user-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0.85rem;
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.08) 0%, rgba(0, 74, 173, 0.18) 100%);
      border: 1px solid rgba(56, 182, 255, 0.22);
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .drawer-user-card:hover {
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.16) 0%, rgba(0, 74, 173, 0.3) 100%);
      border-color: #38b6ff;
      transform: translateY(-1px);
    }

    .user-avatar-mini {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
      border: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 2px 8px rgba(0, 74, 173, 0.3);
    }

    .user-status-dot {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      border: 1.5px solid #0b132b;
    }

    .user-info-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 0.88rem;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.68rem;
      color: #38b6ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-arrow {
      color: #64748b;
      display: flex;
      align-items: center;
      transition: transform 0.2s ease, color 0.2s ease;
    }

    .drawer-user-card:hover .user-arrow {
      color: #38b6ff;
      transform: translateX(2px);
    }

    /* Links de Navegação Mobile Agrupados */
    .mobile-nav-links {
      flex: 1;
      padding: 0.5rem 1rem 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(56, 182, 255, 0.2) transparent;
    }

    .mobile-nav-links::-webkit-scrollbar {
      width: 4px;
    }

    .mobile-nav-links::-webkit-scrollbar-thumb {
      background: rgba(56, 182, 255, 0.2);
      border-radius: 4px;
    }

    .drawer-section-label {
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 0.65rem 0.5rem 0.2rem 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .drawer-section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.07);
    }

    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      color: #cbd5e1;
      text-decoration: none;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.88rem;
      font-weight: 500;
      border-radius: 9px;
      transition: all 0.15s ease;
    }

    .mobile-nav-item .icon-wrap {
      color: #38b6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .mobile-nav-item:hover {
      background: rgba(255, 255, 255, 0.07);
      color: #ffffff;
    }

    .mobile-nav-item.active {
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.22) 0%, rgba(0, 74, 173, 0.35) 100%);
      color: #ffffff;
      border: 1px solid rgba(56, 182, 255, 0.4);
      font-weight: 600;
      box-shadow: 0 2px 10px rgba(56, 182, 255, 0.15);
    }

    /* Destaque para Central de Administração no Mobile */
    .admin-nav-item {
      background: rgba(56, 182, 255, 0.06);
      border: 1px solid rgba(56, 182, 255, 0.22);
    }

    .admin-nav-item:hover {
      background: rgba(56, 182, 255, 0.15);
      border-color: #38b6ff;
    }

    .nav-text-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
    }

    .badge-hub {
      font-size: 0.62rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      padding: 0.15rem 0.45rem;
      border-radius: 50px;
      box-shadow: 0 1px 6px rgba(56, 182, 255, 0.35);
    }

    .mobile-drawer-footer {
      padding: 1rem 1rem 1.1rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(11, 19, 43, 0.95);
    }

    .mobile-drawer-brand-footnote {
      margin-top: 0.6rem;
      text-align: center;
      font-size: 0.65rem;
      color: #64748b;
      letter-spacing: 0.03em;
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
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  loginModalOpen = false;
  profile: UserProfile;
  currentAvatar: SystemAvatar;

  constructor(
    public readonly userService: UserService,
    private readonly router: Router,
  ) {
    this.profile = this.userService.currentProfile;
    this.currentAvatar = this.userService.getAvatarById(this.profile.avatarId);

    // Fecha o menu mobile automaticamente ao navegar
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  ngOnInit(): void {
    this.userService.profile$.subscribe((p) => {
      this.profile = p;
      this.currentAvatar = this.userService.getAvatarById(p.avatarId);
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  openLoginNotice(): void {
    this.loginModalOpen = true;
  }
}
