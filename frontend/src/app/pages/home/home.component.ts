import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-wrapper" id="inicio">
      <!-- 1. Header Flutuante Suspenso (idêntico ao do logado) -->
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
            <a href="#inicio" class="nav-link">Início</a>
            <a href="#sobre" class="nav-link">Sobre</a>
            <a routerLink="/updates" class="nav-link">Atualizações</a>
          </nav>

          <!-- Ação Direita: APENAS o botão de Login levando para o dashboard -->
          <div class="header-actions">
            <a routerLink="/dashboard" class="btn-login-header" title="Fazer Login">
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
          <a href="#inicio" (click)="closeMobileMenu()" class="mobile-nav-item">
            <span>Início</span>
          </a>
          <a href="#sobre" (click)="closeMobileMenu()" class="mobile-nav-item">
            <span>Sobre</span>
          </a>
          <a routerLink="/updates" (click)="closeMobileMenu()" class="mobile-nav-item">
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

      <!-- 2. Hero Section com Degradê Refinado e Título Nítido -->
      <section class="hero-section">
        <div class="hero-glow"></div>
        <div class="hero-container">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>ECOSSISTEMA BLUE FOX &bull; GESTÃO INTELIGENTE DE GASTOS</span>
          </div>

          <h1 class="hero-title">
            Controle Financeiro de Alta Precisão &
            <span class="title-highlight">Orçamento Estruturado</span>
          </h1>

          <p class="hero-subtitle">
            Gerencie compras em lote, parcelamentos inteligentes com cálculo automático de fechamento de cartões
            e múltiplos compradores com a clareza e confiabilidade que o seu controle financeiro precisa.
          </p>

          <!-- Apenas o botão de Login conforme solicitado -->
          <div class="hero-buttons">
            <a routerLink="/dashboard" class="hero-btn-login">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Fazer Login</span>
            </a>

            <a href="#sobre" class="hero-btn-secondary">
              <span>Conhecer a Origem</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </a>
          </div>

          <!-- Mockup Fiel do Dashboard (Apenas dados reais já implementados) -->
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
                  <span>bluefox-finance/dashboard</span>
                </div>
                <div class="mockup-badge">VERSÃO ATIVA &bull; v1.1</div>
              </div>

              <div class="mockup-body">
                <div class="mockup-stats-grid">
                  <div class="mstat-card blue">
                    <div class="mstat-label">Total de Despesas</div>
                    <div class="mstat-val">R$ 14.850,20</div>
                    <div class="mstat-sub">Mês de referência ativo</div>
                  </div>
                  <div class="mstat-card cyan">
                    <div class="mstat-label">Itens & Lançamentos</div>
                    <div class="mstat-val">128 itens</div>
                    <div class="mstat-sub">Compras categorizadas</div>
                  </div>
                  <div class="mstat-card green">
                    <div class="mstat-label">Cálculo de Faturas</div>
                    <div class="mstat-val">100% exato</div>
                    <div class="mstat-sub">Por dia de fechamento</div>
                  </div>
                  <div class="mstat-card purple">
                    <div class="mstat-label">Compradores</div>
                    <div class="mstat-val">Multi-titular</div>
                    <div class="mstat-sub">Divisão e rateio claro</div>
                  </div>
                </div>

                <div class="mockup-features-strip">
                  <div class="mstrip-item">
                    <span class="badge-mini-dot"></span>
                    <span>Lançamentos em Lote com Múltiplos Itens</span>
                  </div>
                  <div class="mstrip-item">
                    <span class="badge-mini-dot"></span>
                    <span>Projeção Automática de Parcelas</span>
                  </div>
                  <div class="mstrip-item">
                    <span class="badge-mini-dot"></span>
                    <span>Categorias de Itens e Lojas Cadastradas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Recursos Já Implementados no Sistema -->
      <section class="features-section">
        <div class="section-container">
          <div class="section-badge">RECURSOS DISPONÍVEIS HOJE</div>
          <h2 class="section-title">O que o BlueFox Finance entrega</h2>
          <p class="section-subtitle">
            Funcionalidades operacionais prontas para uso no controle diário de gastos pessoais e em equipe.
          </p>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <h3 class="feature-name">Parcelamento por Fechamento</h3>
              <p class="feature-desc">
                Cálculo inteligente do mês de competência da fatura baseado no dia de fechamento do cartão de crédito, sem necessidade de ajuste manual.
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
              <h3 class="feature-name">Divisão por Compradores</h3>
              <p class="feature-desc">
                Identifique exatamente quem realizou cada despesa dentro de uma mesma compra ou fatura, simplificando cobranças e rateios familiares.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon icon-teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3 class="feature-name">Catálogo de Lojas & Categorias</h3>
              <p class="feature-desc">
                Classificação em dois níveis: estabelecimentos comerciais (Supermercado, Farmácia, E-commerce) e tipos de produtos com cores customizáveis.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="9"/>
                  <rect x="14" y="3" width="7" height="5"/>
                  <rect x="14" y="12" width="7" height="9"/>
                  <rect x="3" y="16" width="7" height="5"/>
                </svg>
              </div>
              <h3 class="feature-name">Dashboard & Indicadores</h3>
              <p class="feature-desc">
                Visão do mês com totalizadores, filtros por período, faturas futuras agrupadas por meio de pagamento e controle de orçamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Seção SOBRE: A Origem do Sistema & Blue Fox Global Group -->
      <section id="sobre" class="about-section">
        <div class="section-container">
          <div class="about-card">
            <div class="about-header">
              <div class="section-badge">NOSSA HISTÓRIA & GOVERNANÇA</div>
              <h2 class="about-main-title">A Origem do BlueFox Finance</h2>
              <p class="about-subtitle">
                Conheça como a ferramenta nasceu dentro do grupo para resolver uma dor real de gestão e como ela evoluiu.
              </p>
            </div>

            <div class="about-grid">
              <!-- Bloco 1: A Fundação -->
              <div class="about-box">
                <div class="about-box-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 class="about-box-title">Por que o sistema foi criado?</h3>
                <p class="about-box-text">
                  O <strong>BlueFox Finance</strong> nasceu da necessidade concreta de controle e governança financeira dentro das operações do <strong>Blue Fox Global Group</strong>. 
                  Com múltiplas compras corporativas, cartões empresariais com datas de fechamento distintas e despesas realizadas por diferentes membros, planilhas tradicionais geravam divergências e falta de previsibilidade orçamentária.
                </p>
                <p class="about-box-text">
                  O sistema foi desenvolvido para calcular automaticamente em qual fatura cada despesa incide e manter o faturamento e os orçamentos sob rígido acompanhamento.
                </p>
              </div>

              <!-- Bloco 2: A Abertura para o Público -->
              <div class="about-box">
                <div class="about-box-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 class="about-box-title">Abertura para o Público</h3>
                <p class="about-box-text">
                  Após consolidar o algoritmo de cálculo de faturas, a gestão de múltiplos compradores e a separação de lançamentos em lote, percebemos que essa mesma dor afetava famílias, pequenos negócios e profissionais independentes.
                </p>
                <p class="about-box-text">
                  Decidimos então disponibilizar a plataforma para o público externo, permitindo que qualquer pessoa utilize a mesma precisão de governança antes restrita às operações internas do grupo.
                </p>
              </div>

              <!-- Bloco 3: O Blue Fox Global Group & Keycloak -->
              <div class="about-box full-span">
                <div class="about-box-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 class="about-box-title">O que é o Blue Fox Global Group e seu papel no sistema</h3>
                <p class="about-box-text">
                  O <strong>Blue Fox Global Group</strong> é o grupo holding que concebe, desenvolve e investe em iniciativas de tecnologia, soluções corporativas, infraestrutura e inovação. No BlueFox Finance, o papel do grupo é atuar como guardião da governança, suporte à infraestrutura e segurança da informação.
                </p>
                <div class="keycloak-mention-box">
                  <div class="keycloak-tag">Papel na Segurança & Keycloak</div>
                  <p class="keycloak-text">
                    O <strong>Blue Fox Global Group</strong> é o responsável por orquestrar a infraestrutura central de identidade da organização. Para o futuro deploy online em larga escala, o grupo está estruturando a integração do <strong>Keycloak SSO (IAM)</strong>, que funcionará como provedor unificado de identidade e autenticação federada (Single Sign-On), garantindo controle de acesso granular e proteção de ponta a ponta em todos os produtos do grupo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Chamada Final Discreta (Apenas botão de Login) -->
      <section class="cta-section">
        <div class="section-container">
          <div class="cta-box">
            <h2 class="cta-title">Acesse o Sistema</h2>
            <p class="cta-subtitle">
              Faça login para gerenciar suas despesas, cadastros e faturas.
            </p>
            <div class="cta-actions">
              <a routerLink="/dashboard" class="hero-btn-login">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Fazer Login</span>
              </a>

              <a routerLink="/updates" class="btn-ghost-link">
                <span>Ver Atualizações & Roadmap</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
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
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre</a>
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
      overflow-x: hidden;
    }

    .home-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* 1. Header Flutuante Suspenso (idêntico ao logado) */
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
      gap: 0.65rem;
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
      padding: 0.45rem 1.25rem;
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

    /* 2. Hero Section Refinado */
    .hero-section {
      position: relative;
      padding: 5.5rem 1.5rem 4rem 1.5rem;
      background: 
        radial-gradient(circle at 50% 10%, rgba(0, 74, 173, 0.38) 0%, rgba(8, 15, 36, 0) 65%),
        radial-gradient(circle at 85% 25%, rgba(56, 182, 255, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 15% 45%, rgba(0, 74, 173, 0.15) 0%, transparent 50%),
        #080f24;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 850px;
      height: 480px;
      background: radial-gradient(circle, rgba(56, 182, 255, 0.2) 0%, rgba(0, 74, 173, 0.1) 50%, transparent 75%);
      pointer-events: none;
      filter: blur(60px);
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
      padding: 0.4rem 1.15rem;
      background: rgba(56, 182, 255, 0.08);
      border: 1px solid rgba(56, 182, 255, 0.28);
      border-radius: 50px;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #38b6ff;
      margin-bottom: 1.5rem;
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #38b6ff;
      box-shadow: 0 0 8px #38b6ff;
    }

    /* Título com Alto Contraste */
    .hero-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 3.3rem;
      font-weight: 800;
      color: #ffffff; /* Branco puro de alto contraste */
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      line-height: 1.15;
      letter-spacing: -0.025em;
      max-width: 920px;
      margin: 0 0 1.35rem 0;
    }

    .title-highlight {
      color: #38b6ff; /* Ciano nítido e vibrante */
      display: inline-block;
      text-shadow: 0 0 25px rgba(56, 182, 255, 0.4);
    }

    .hero-subtitle {
      font-size: 1.15rem;
      line-height: 1.65;
      color: #cbd5e1; /* Cinza claro bem legível */
      max-width: 720px;
      margin: 0 0 2.5rem 0;
    }

    .hero-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      margin-bottom: 3.5rem;
      flex-wrap: wrap;
    }

    .hero-btn-login {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      padding: 0.9rem 2.5rem;
      border-radius: 50px;
      font-size: 1.05rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 25px rgba(56, 182, 255, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.25s ease;
    }

    .hero-btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(56, 182, 255, 0.6);
    }

    .hero-btn-secondary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      padding: 0.9rem 1.85rem;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .hero-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border-color: #38b6ff;
    }

    /* Preview Mockup Card */
    .preview-card-wrap {
      width: 100%;
      max-width: 980px;
      position: relative;
    }

    .preview-card-glow {
      position: absolute;
      inset: -4px;
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.25) 0%, rgba(0, 74, 173, 0.2) 100%);
      filter: blur(25px);
      border-radius: 22px;
      z-index: 1;
    }

    .preview-card {
      position: relative;
      z-index: 2;
      background: #0d1733;
      border: 1px solid rgba(56, 182, 255, 0.25);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      text-align: left;
    }

    .mockup-header {
      background: #070e22;
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

    .mstat-sub {
      font-size: 0.7rem;
      color: #64748b;
    }

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
      background: #060c1d;
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
      margin: 0 0 0.75rem 0;
    }

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

    /* 4. Seção SOBRE */
    .about-section {
      padding: 5.5rem 1.5rem;
      background: #080f24;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .about-card {
      background: linear-gradient(135deg, rgba(13, 23, 51, 0.95) 0%, rgba(8, 15, 36, 0.98) 100%);
      border: 1px solid rgba(56, 182, 255, 0.22);
      border-radius: 24px;
      padding: 3.5rem 2.5rem;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);
    }

    .about-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .about-main-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 2.35rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.75rem 0;
    }

    .about-subtitle {
      font-size: 1.05rem;
      color: #94a3b8;
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .about-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.75rem;
      text-align: left;
    }

    .about-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .about-box.full-span {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.04) 0%, rgba(0, 74, 173, 0.1) 100%);
      border-color: rgba(56, 182, 255, 0.25);
    }

    .about-box-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.35rem;
    }

    .about-box-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .about-box-text {
      font-size: 0.92rem;
      line-height: 1.65;
      color: #cbd5e1;
      margin: 0;
    }

    .about-box-text strong {
      color: #38b6ff;
    }

    .keycloak-mention-box {
      margin-top: 0.85rem;
      background: rgba(11, 19, 43, 0.7);
      border-left: 3px solid #38b6ff;
      border-radius: 0 10px 10px 0;
      padding: 1rem 1.25rem;
    }

    .keycloak-tag {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #38b6ff;
      margin-bottom: 0.4rem;
    }

    .keycloak-text {
      font-size: 0.88rem;
      color: #cbd5e1;
      line-height: 1.55;
      margin: 0;
    }

    /* 5. CTA Section */
    .cta-section {
      padding: 4.5rem 1.5rem;
      background: #060c1d;
    }

    .cta-box {
      max-width: 780px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgba(13, 23, 51, 0.8) 0%, rgba(8, 15, 36, 0.9) 100%);
      border: 1px solid rgba(56, 182, 255, 0.3);
      border-radius: 20px;
      padding: 3rem 2rem;
      text-align: center;
    }

    .cta-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 2.1rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.85rem 0;
    }

    .cta-subtitle {
      font-size: 1.05rem;
      color: #94a3b8;
      max-width: 540px;
      margin: 0 auto 2rem auto;
      line-height: 1.6;
    }

    .cta-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .btn-ghost-link {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: #38b6ff;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      padding: 0.85rem 1.5rem;
      border-radius: 50px;
      border: 1px solid rgba(56, 182, 255, 0.3);
      transition: all 0.2s ease;
    }

    .btn-ghost-link:hover {
      background: rgba(56, 182, 255, 0.1);
      border-color: #38b6ff;
    }

    /* 6. Footer */
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

    @media (max-width: 900px) {
      .about-grid { grid-template-columns: 1fr; }
      .mockup-stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .public-nav { display: none; }
      .hamburger-btn { display: flex; }
      .hero-title { font-size: 2.2rem; }
      .hero-subtitle { font-size: 1rem; }
      .mockup-features-strip { flex-direction: column; align-items: flex-start; }
      .mockup-stats-grid { grid-template-columns: 1fr; }
      .about-card { padding: 2rem 1.25rem; }
      .footer-container {
        flex-direction: column;
        text-align: center;
      }
    }
  `],
})
export class HomeComponent {
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
