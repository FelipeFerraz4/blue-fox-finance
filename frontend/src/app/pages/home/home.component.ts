import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoticeModalComponent } from '../../components/notice-modal/notice-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NoticeModalComponent],
  template: `
    <div class="home-wrapper">
      <!-- 1. Header Público do Portal -->
      <header class="public-header">
        <div class="header-container">
          <div class="brand">
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
          </div>

          <nav class="public-nav">
            <a href="#features" class="nav-link">Recursos</a>
            <a href="#architecture" class="nav-link">Arquitetura</a>
            <a href="#security" class="nav-link">Segurança & IAM</a>
          </nav>

          <div class="header-actions">
            <button
              type="button"
              class="btn-login-public"
              (click)="loginModalOpen = true"
              title="Acessar com Keycloak SSO"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Login SSO</span>
            </button>

            <a routerLink="/dashboard" class="btn-primary-public">
              <span>Acessar Plataforma</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </header>

      <!-- 2. Hero Section -->
      <section class="hero-section">
        <div class="hero-glow"></div>
        <div class="hero-container">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>ECOSSISTEMA BLUE FOX &bull; GESTÃO FINANCEIRA INTELIGENTE</span>
          </div>

          <h1 class="hero-title">
            Controle Financeiro de Alta Precisão &
            <span class="gradient-text">Governança Corporativa</span>
          </h1>

          <p class="hero-subtitle">
            Gerencie despesas, cartões corporativos, parcelamentos calculados automaticamente
            e múltiplos compradores com a arquitetura moderna e segura da Blue Fox.
          </p>

          <div class="hero-buttons">
            <a routerLink="/dashboard" class="hero-btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="3" width="7" height="9"/>
                <rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/>
                <rect x="3" y="16" width="7" height="5"/>
              </svg>
              <span>Entrar na Plataforma</span>
            </a>

            <button type="button" class="hero-btn-secondary" (click)="loginModalOpen = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Autenticação Keycloak IAM</span>
            </button>
          </div>

          <!-- Hero Mockup Preview Card -->
          <div class="preview-card-wrap">
            <div class="preview-card-glow"></div>
            <div class="preview-card">
              <div class="mockup-header">
                <div class="window-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <div class="mockup-url-bar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>https://finance.bluefox.internal/dashboard</span>
                </div>
                <div class="mockup-badge">ONLINE &bull; v2.4</div>
              </div>

              <div class="mockup-body">
                <!-- Mini Stats Mockup Grid -->
                <div class="mockup-stats-grid">
                  <div class="mstat-card blue">
                    <div class="mstat-label">Total do Mês Atual</div>
                    <div class="mstat-val">R$ 14.850,20</div>
                    <div class="mstat-trend positive">+3.2% vs mês anterior</div>
                  </div>
                  <div class="mstat-card cyan">
                    <div class="mstat-label">Lançamentos Processados</div>
                    <div class="mstat-val">128</div>
                    <div class="mstat-trend">100% categorizados</div>
                  </div>
                  <div class="mstat-card green">
                    <div class="mstat-label">Parcelamentos Ativos</div>
                    <div class="mstat-val">18 planos</div>
                    <div class="mstat-trend">Previsibilidade total</div>
                  </div>
                  <div class="mstat-card purple">
                    <div class="mstat-label">SSO IAM Security</div>
                    <div class="mstat-val">Keycloak Ready</div>
                    <div class="mstat-trend active">RBAC / OpenID Connect</div>
                  </div>
                </div>

                <!-- Mini visual row -->
                <div class="mockup-features-strip">
                  <div class="mstrip-item">
                    <span class="badge-mini-dot"></span>
                    <span>Cálculo de Fechamento de Faturas em Tempo Real</span>
                  </div>
                  <div class="mstrip-item">
                    <span class="badge-mini-dot"></span>
                    <span>Relatórios Multi-Comprador e Rateio Automático</span>
                  </div>
                  <div class="mstrip-item">
                    <span class="badge-mini-dot"></span>
                    <span>Gestão Centralizada de Categorias e Estabelecimentos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Recursos Principais (Features) -->
      <section id="features" class="features-section">
        <div class="section-container">
          <div class="section-badge">FUNCIONALIDADES ENTERPRISE</div>
          <h2 class="section-title">Engenharia Financeira para Máxima Clareza</h2>
          <p class="section-subtitle">
            Cada recurso foi desenvolvido com foco em desempenho, precisão matemática e conforto operacional.
          </p>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <h3 class="feature-name">Parcelamentos Inteligentes</h3>
              <p class="feature-desc">
                Projeção automática de parcelas com cálculo exato do mês de competência baseado no dia de fechamento do cartão de crédito.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon icon-cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 class="feature-name">Múltiplos Compradores</h3>
              <p class="feature-desc">
                Controle detalhado de despesas por indivíduo, simplificando reembolsos e divisão de despesas familiares ou de equipes.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon icon-teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3 class="feature-name">Lojas & Categorização</h3>
              <p class="feature-desc">
                Catálogo completo de estabelecimentos e categorização em dois níveis (itens e lojas) com badges visuais padronizados.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 class="feature-name">Keycloak Identity Provider</h3>
              <p class="feature-desc">
                Pronto para autenticação federada com Keycloak SSO corporativo, proteção OAuth2 / OIDC e políticas de segurança Zero-Trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Arquitetura e Segurança IAM -->
      <section id="architecture" class="architecture-section">
        <div class="section-container">
          <div class="arch-box">
            <div class="arch-content">
              <div class="section-badge">GOVERNANÇA & SEGURANÇA</div>
              <h2 class="section-title text-left">Preparado para Operação Online com Keycloak SSO</h2>
              <p class="section-subtitle text-left">
                Quando a plataforma for publicada em ambiente de produção, todas as rotas internas de gestão
                (Dashboard, Despesas, Cadastros e Central de Admin) serão protegidas pelo gateway de autenticação
                corporativo Keycloak.
              </p>

              <div class="arch-points">
                <div class="arch-point">
                  <div class="arch-point-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Single Sign-On (SSO) Unificado:</strong> Acesso simplificado com as mesmas credenciais da suíte corporativa Blue Fox.
                  </div>
                </div>

                <div class="arch-point">
                  <div class="arch-point-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Controle de Acesso Baseado em Papéis (RBAC):</strong> Perfis distintos para Administradores, Gestores e Visualizadores.
                  </div>
                </div>

                <div class="arch-point">
                  <div class="arch-point-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Rotas REST em Inglês & Padrão OpenAPI:</strong> API limpa e padronizada (<code>/api/expenses</code>, <code>/api/stores</code>, etc.).
                  </div>
                </div>
              </div>

              <div class="arch-actions">
                <button type="button" class="btn-primary-public" (click)="loginModalOpen = true">
                  <span>Simular Conexão Keycloak SSO</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="arch-diagram">
              <div class="diagram-card">
                <div class="diagram-step active">
                  <div class="step-num">01</div>
                  <div class="step-info">
                    <span class="step-title">Portal Público</span>
                    <span class="step-desc">Landing Page de Apresentação</span>
                  </div>
                </div>
                <div class="diagram-connector">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
                <div class="diagram-step highlight">
                  <div class="step-num">02</div>
                  <div class="step-info">
                    <span class="step-title">Keycloak Identity Provider (IAM)</span>
                    <span class="step-desc">SSO OpenID Connect &bull; MFA &bull; RBAC</span>
                  </div>
                </div>
                <div class="diagram-connector">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
                <div class="diagram-step">
                  <div class="step-num">03</div>
                  <div class="step-info">
                    <span class="step-title">BlueFox Finance Core</span>
                    <span class="step-desc">Dashboard &bull; Despesas &bull; Administração</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Call To Action Final -->
      <section class="cta-section">
        <div class="section-container">
          <div class="cta-card">
            <h2 class="cta-title">Explore a Experiência Interna da Plataforma</h2>
            <p class="cta-desc">
              Você pode navegar pelo ambiente completo de demonstração para testar todas as funcionalidades
              de gestão de despesas, cartões e categorias.
            </p>
            <div class="cta-buttons">
              <a routerLink="/dashboard" class="hero-btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <rect x="3" y="3" width="7" height="9"/>
                  <rect x="14" y="3" width="7" height="5"/>
                  <rect x="14" y="12" width="7" height="9"/>
                  <rect x="3" y="16" width="7" height="5"/>
                </svg>
                <span>Acessar Dashboard Interno</span>
              </a>
              <a routerLink="/expenses" class="btn-ghost-public">
                <span>Ver Lançamentos</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Rodapé Público -->
      <footer class="public-footer">
        <div class="footer-container">
          <div class="footer-brand">
            <div class="logo-box-mini">
              <img src="assets/logo.png" alt="Blue Fox Logo" class="brand-logo-mini"/>
            </div>
            <span class="footer-brand-name">BlueFox Finance</span>
          </div>

          <div class="footer-links">
            <a routerLink="/dashboard">Dashboard</a>
            <a routerLink="/expenses">Lançamentos</a>
            <a routerLink="/stores">Lojas</a>
            <a routerLink="/payment-methods">Pagamentos</a>
            <a routerLink="/admin">Admin Hub</a>
          </div>

          <div class="footer-copy">
            &copy; 2026 Blue Fox Group &bull; Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <!-- Modal Reutilizável de Keycloak Login -->
      <app-notice-modal
        [isOpen]="loginModalOpen"
        title="Autenticação BlueFox"
        badge="Keycloak SSO"
        message="O sistema de autenticação corporativo com Keycloak SSO está em preparação para o deploy online."
        details="Em ambiente de produção, esta tela será a porta de entrada obrigatória para proteger o ecossistema interno, garantindo controle de permissões por perfil (RBAC) e Single Sign-On unificado."
        type="keycloak"
        confirmText="Entendido"
        (close)="loginModalOpen = false"
      ></app-notice-modal>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      background: #0b132b; /* Navy Oficial Blue Fox */
      color: #ffffff;
      font-family: var(--font-body, 'Inter', sans-serif);
      overflow-x: hidden;
    }

    .home-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* 1. Header Público */
    .public-header {
      position: sticky;
      top: 0;
      z-index: 999;
      background: rgba(11, 19, 43, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(56, 182, 255, 0.18);
      width: 100%;
    }

    .header-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0.85rem 1.75rem;
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
      width: 42px;
      height: 42px;
      background: #ffffff;
      border-radius: 12px;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(56, 182, 255, 0.35);
      box-shadow: 0 0 16px rgba(56, 182, 255, 0.35);
      overflow: hidden;
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
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .brand-tag {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #38b6ff;
    }

    .public-nav {
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }

    .nav-link {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .nav-link:hover {
      color: #38b6ff;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .btn-login-public {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(56, 182, 255, 0.3);
      color: #ffffff;
      padding: 0.5rem 1.15rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-login-public:hover {
      background: rgba(56, 182, 255, 0.15);
      border-color: #38b6ff;
      box-shadow: 0 0 12px rgba(56, 182, 255, 0.25);
    }

    .btn-primary-public {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      padding: 0.5rem 1.25rem;
      border-radius: 50px;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 2px 14px rgba(56, 182, 255, 0.35);
      transition: all 0.2s ease;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .btn-primary-public:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(56, 182, 255, 0.5);
    }

    /* 2. Hero Section */
    .hero-section {
      position: relative;
      padding: 5rem 1.5rem 4rem 1.5rem;
      overflow: hidden;
      background: radial-gradient(circle at 50% 20%, rgba(0, 74, 173, 0.3) 0%, rgba(11, 19, 43, 0) 70%);
    }

    .hero-glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 400px;
      background: radial-gradient(circle, rgba(56, 182, 255, 0.18) 0%, rgba(0, 0, 0, 0) 70%);
      pointer-events: none;
      filter: blur(50px);
    }

    .hero-container {
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1.1rem;
      background: rgba(56, 182, 255, 0.1);
      border: 1px solid rgba(56, 182, 255, 0.3);
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #38b6ff;
      margin-bottom: 1.5rem;
      box-shadow: 0 0 15px rgba(56, 182, 255, 0.15);
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #38b6ff;
      box-shadow: 0 0 8px #38b6ff;
      animation: pulse 2s infinite;
    }

    .hero-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 3.25rem;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      max-width: 900px;
      margin-bottom: 1.25rem;
    }

    .gradient-text {
      background: linear-gradient(135deg, #ffffff 0%, #38b6ff 50%, #004aad 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
    }

    .hero-subtitle {
      font-size: 1.15rem;
      line-height: 1.6;
      color: #94a3b8;
      max-width: 720px;
      margin-bottom: 2.25rem;
    }

    .hero-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      margin-bottom: 3.5rem;
      flex-wrap: wrap;
    }

    .hero-btn-primary {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      padding: 0.9rem 2.2rem;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 25px rgba(56, 182, 255, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.25s ease;
    }

    .hero-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(56, 182, 255, 0.65);
    }

    .hero-btn-secondary {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(56, 182, 255, 0.35);
      color: #ffffff;
      padding: 0.9rem 2.1rem;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .hero-btn-secondary:hover {
      background: rgba(56, 182, 255, 0.12);
      border-color: #38b6ff;
      box-shadow: 0 0 20px rgba(56, 182, 255, 0.25);
      transform: translateY(-1px);
    }

    /* Preview Mockup Card */
    .preview-card-wrap {
      width: 100%;
      max-width: 980px;
      position: relative;
    }

    .preview-card-glow {
      position: absolute;
      inset: -5px;
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.3) 0%, rgba(0, 74, 173, 0.2) 100%);
      filter: blur(25px);
      border-radius: 24px;
      z-index: 1;
    }

    .preview-card {
      position: relative;
      z-index: 2;
      background: #0f1c3f;
      border: 1px solid rgba(56, 182, 255, 0.25);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      text-align: left;
    }

    .mockup-header {
      background: #091024;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .window-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }

    .mockup-url-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.3rem 1.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #94a3b8;
      font-family: monospace;
    }

    .mockup-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 0.05em;
    }

    .mockup-body {
      padding: 1.5rem;
    }

    .mockup-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .mstat-card {
      padding: 1.15rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .mstat-card.blue { border-left: 3px solid #38b6ff; }
    .mstat-card.cyan { border-left: 3px solid #004aad; }
    .mstat-card.green { border-left: 3px solid #10b981; }
    .mstat-card.purple { border-left: 3px solid #8b5cf6; }

    .mstat-label {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }

    .mstat-val {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .mstat-trend {
      font-size: 0.7rem;
      color: #64748b;
    }

    .mstat-trend.positive { color: #10b981; }
    .mstat-trend.active { color: #38b6ff; font-weight: 600; }

    .mockup-features-strip {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 1rem;
      padding: 0.85rem 1rem;
      background: rgba(56, 182, 255, 0.04);
      border: 1px solid rgba(56, 182, 255, 0.15);
      border-radius: 10px;
    }

    .mstrip-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: #cbd5e1;
      font-weight: 500;
    }

    .badge-mini-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #38b6ff;
    }

    /* 3. Features Section */
    .features-section {
      padding: 5rem 1.5rem;
      background: #091024;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
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

    .section-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 2.35rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.75rem;
    }

    .section-title.text-left { text-align: left; }
    .section-subtitle.text-left { text-align: left; }

    .section-subtitle {
      font-size: 1.05rem;
      color: #94a3b8;
      max-width: 680px;
      margin: 0 auto 3.5rem auto;
      line-height: 1.6;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.75rem;
      text-align: left;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 1.85rem;
      transition: all 0.25s ease;
    }

    .feature-card:hover {
      background: rgba(56, 182, 255, 0.04);
      border-color: rgba(56, 182, 255, 0.3);
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .icon-blue {
      background: rgba(0, 74, 173, 0.25);
      color: #38b6ff;
      border: 1px solid rgba(56, 182, 255, 0.3);
    }

    .icon-cyan {
      background: rgba(56, 182, 255, 0.15);
      color: #38b6ff;
      border: 1px solid rgba(56, 182, 255, 0.3);
    }

    .icon-teal {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .icon-purple {
      background: rgba(139, 92, 246, 0.15);
      color: #a78bfa;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .feature-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.65rem;
    }

    .feature-desc {
      font-size: 0.88rem;
      color: #94a3b8;
      line-height: 1.55;
    }

    /* 4. Arquitetura Section */
    .architecture-section {
      padding: 5rem 1.5rem;
      background: #0b132b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .arch-box {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 3.5rem;
      align-items: center;
    }

    .arch-points {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin: 2rem 0 2.5rem 0;
      text-align: left;
    }

    .arch-point {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.5;
    }

    .arch-point strong {
      color: #ffffff;
    }

    .arch-point code {
      background: rgba(56, 182, 255, 0.15);
      color: #38b6ff;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .arch-point-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(56, 182, 255, 0.12);
      border: 1px solid rgba(56, 182, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 0.15rem;
    }

    .arch-actions {
      display: flex;
      gap: 1rem;
    }

    /* Diagram Card */
    .arch-diagram {
      display: flex;
      justify-content: center;
    }

    .diagram-card {
      width: 100%;
      max-width: 380px;
      background: #0f1c3f;
      border: 1px solid rgba(56, 182, 255, 0.25);
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
    }

    .diagram-step {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1rem;
      text-align: left;
    }

    .diagram-step.highlight {
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.12) 0%, rgba(0, 74, 173, 0.25) 100%);
      border-color: #38b6ff;
      box-shadow: 0 0 18px rgba(56, 182, 255, 0.2);
    }

    .step-num {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.25rem;
      font-weight: 800;
      color: #38b6ff;
      background: rgba(56, 182, 255, 0.12);
      border-radius: 8px;
      padding: 0.35rem 0.65rem;
    }

    .step-info {
      display: flex;
      flex-direction: column;
    }

    .step-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #ffffff;
    }

    .step-desc {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .diagram-connector {
      display: flex;
      justify-content: center;
      padding: 0.2rem 0;
      opacity: 0.7;
    }

    /* 5. CTA Section */
    .cta-section {
      padding: 4.5rem 1.5rem;
      background: radial-gradient(circle at 50% 50%, rgba(0, 74, 173, 0.25) 0%, rgba(11, 19, 43, 0) 70%);
    }

    .cta-card {
      max-width: 860px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgba(15, 28, 63, 0.9) 0%, rgba(11, 19, 43, 0.95) 100%);
      border: 1px solid rgba(56, 182, 255, 0.35);
      border-radius: 24px;
      padding: 3.5rem 2.5rem;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
      text-align: center;
    }

    .cta-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 2.25rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1rem;
    }

    .cta-desc {
      font-size: 1.05rem;
      color: #94a3b8;
      max-width: 600px;
      margin: 0 auto 2.25rem auto;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .btn-ghost-public {
      color: #38b6ff;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      padding: 0.85rem 1.75rem;
      border-radius: 50px;
      border: 1px solid rgba(56, 182, 255, 0.3);
      transition: all 0.2s ease;
    }

    .btn-ghost-public:hover {
      background: rgba(56, 182, 255, 0.1);
      border-color: #38b6ff;
    }

    /* 6. Footer Público */
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

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    /* Responsividade Mobile */
    @media (max-width: 900px) {
      .mockup-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .arch-box {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .arch-diagram {
        width: 100%;
      }
      .diagram-card {
        max-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .public-nav {
        display: none;
      }
      .hero-title {
        font-size: 2.1rem;
      }
      .hero-subtitle {
        font-size: 1rem;
      }
      .mockup-features-strip {
        flex-direction: column;
        align-items: flex-start;
      }
      .mockup-stats-grid {
        grid-template-columns: 1fr;
      }
      .footer-container {
        flex-direction: column;
        text-align: center;
        gap: 1.25rem;
      }
      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `],
})
export class HomeComponent {
  loginModalOpen = false;
}
