import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page-wrapper">
      <!-- Header Flutuante Suspenso (idêntico ao do logado) -->
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
            <a routerLink="/about" class="nav-link active">Sobre</a>
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
          <a routerLink="/" (click)="closeMobileMenu()" class="mobile-nav-item">
            <span>Início</span>
          </a>
          <a routerLink="/about" (click)="closeMobileMenu()" class="mobile-nav-item active">
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

      <!-- Conteúdo Principal da Página Sobre -->
      <main class="about-main">
        <!-- Hero Institucional -->
        <section class="about-hero">
          <div class="section-badge">HISTÓRIA & GOVERNANÇA CORPORATIVA</div>
          <h1 class="page-title">Sobre o BlueFox Finance</h1>
          <p class="page-subtitle">
            Como uma solução desenvolvida internamente para resolver os desafios de orçamento e gastos do 
            <span class="text-white font-bold">Blue Fox Global Group</span> evoluiu para uma plataforma aberta de controle financeiro de alta precisão.
          </p>
        </section>

        <!-- Grade de Conteúdo Aprofundado -->
        <div class="story-grid">
          <!-- 1. A Fundação e o Desafio Original -->
          <article class="story-card">
            <div class="card-icon-wrap icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-tag">A FUNDAÇÃO</div>
              <h2 class="card-title">Por que o sistema foi criado?</h2>
              <p class="card-text">
                O <strong>BlueFox Finance</strong> surgiu no seio das operações internas do <strong>Blue Fox Global Group</strong> para resolver uma dor concreta e urgente de governança corporativa: o controle rigoroso de fluxo de despesas, faturamento e previsibilidade de orçamento entre diversas frentes e projetos.
              </p>
              <p class="card-text">
                Com múltiplos cartões corporativos, diferentes dias de fechamento e vencimento de faturas, e despesas realizadas por vários membros da equipe, métodos manuais como planilhas geravam ruídos constantes: parcelas atribuídas ao mês errado, compras sem rastreabilidade de comprador e falta de clareza sobre o impacto no fluxo de caixa futuro.
              </p>
              <div class="card-highlight-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2.2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Solução: Criar um algoritmo matemático que calculasse a competência exata de cada compra com base no dia de fechamento do cartão e registrasse lançamentos em lote com múltiplos itens.</span>
              </div>
            </div>
          </article>

          <!-- 2. A Decisão de Abertura ao Público -->
          <article class="story-card">
            <div class="card-icon-wrap icon-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-tag">EXPANSÃO & DEMOCRATIZAÇÃO</div>
              <h2 class="card-title">A Abertura para o Público</h2>
              <p class="card-text">
                À medida que a ferramenta amadureceu e seu uso diário trouxe tranquilidade orçamentária e previsibilidade total aos gestores do grupo, ficou evidente que essa mesma dificuldade é enfrentada diariamente por famílias, pequenas empresas, parceiros e profissionais independentes.
              </p>
              <p class="card-text">
                Decidiu-se então desvincular a aplicação de amarras estritamente internas e disponibilizá-la publicamente. A plataforma foi lapidada com interface limpa, categorização em dois níveis (itens e estabelecimentos), divisão por compradores e painel analítico com os padrões do Blue Fox Design System.
              </p>
              <div class="card-highlight-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Objetivo: Proporcionar a qualquer usuário o mesmo nível de controle e governança antes acessível apenas às operações internas corporativas.</span>
              </div>
            </div>
          </article>

          <!-- 3. O que é o Blue Fox Global Group -->
          <article class="story-card full-width-card">
            <div class="card-icon-wrap icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-tag">A HOLDING MANTENEDORA</div>
              <h2 class="card-title">O que é o Blue Fox Global Group?</h2>
              <p class="card-text">
                O <strong>Blue Fox Global Group</strong> é o grupo holding que desenvolve, gerencia e investe em ecossistemas de tecnologia, inovação financeira, soluções de infraestrutura e iniciativas multissetoriais. O grupo atua sob pilares rigorosos de segurança da informação, eficiência operacional e excelência em engenharia de software.
              </p>
              <div class="pillars-row">
                <div class="pillar-mini-card">
                  <div class="pillar-label">Finanças & Governança</div>
                  <div class="pillar-desc">Plataformas de gestão orçamentária e previsibilidade matemática de gastos.</div>
                </div>
                <div class="pillar-mini-card">
                  <div class="pillar-label">Infraestrutura & Nuvem</div>
                  <div class="pillar-desc">Arquitetura de contêineres resilientes, alta disponibilidade e segurança Zero-Trust.</div>
                </div>
                <div class="pillar-mini-card">
                  <div class="pillar-label">Design & Experiência</div>
                  <div class="pillar-desc">Padronização visual elegante por meio do Blue Fox Design System.</div>
                </div>
              </div>
            </div>
          </article>

          <!-- 4. O Papel do Grupo e a Arquitetura Keycloak SSO -->
          <article class="story-card full-width-card keycloak-role-card">
            <div class="card-icon-wrap icon-cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-tag">INFRAESTRUTURA & IDENTIDADE</div>
              <h2 class="card-title">O Papel do Grupo no Sistema & O Futuro com Keycloak SSO</h2>
              <p class="card-text">
                No <strong>BlueFox Finance</strong>, o papel do <strong>Blue Fox Global Group</strong> é atuar como provedor de infraestrutura, custodiante das boas práticas de engenharia e guardião da segurança dos dados.
              </p>
              
              <div class="keycloak-explanation-panel">
                <div class="panel-header">
                  <span class="panel-badge">Segurança Corporativa em Preparação</span>
                  <h3 class="panel-title">Por que o Keycloak foi escolhido para o futuro online?</h3>
                </div>
                <p class="panel-text">
                  Para o futuro deploy do sistema em ambiente online aberto em larga escala, o Blue Fox Global Group está projetando a camada de autenticação corporativa centralizada via <strong>Keycloak Identity & Access Management (IAM)</strong>.
                </p>
                <div class="keycloak-points-grid">
                  <div class="kpoint">
                    <div class="kpoint-dot"></div>
                    <div class="kpoint-info">
                      <strong>Single Sign-On (SSO):</strong>
                      <span>Acesso único e unificado para os múltiplos produtos e ferramentas do ecossistema Blue Fox.</span>
                    </div>
                  </div>
                  <div class="kpoint">
                    <div class="kpoint-dot"></div>
                    <div class="kpoint-info">
                      <strong>Protocolos OpenID Connect & OAuth2:</strong>
                      <span>Padrão global da indústria para troca segura de tokens criptografados e proteção de sessões.</span>
                    </div>
                  </div>
                  <div class="kpoint">
                    <div class="kpoint-dot"></div>
                    <div class="kpoint-info">
                      <strong>Controle de Perfis (RBAC):</strong>
                      <span>Gestão granular de permissões e isolamento completo de registros por usuário e organização.</span>
                    </div>
                  </div>
                </div>
                <div class="panel-footnote">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38b6ff" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>Atualmente, a plataforma opera com acesso direto de demonstração pelo botão de Login enquanto a integração federada com o Keycloak é consolidada pelo grupo.</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Seção CTA Final -->
        <section class="bottom-cta-section">
          <div class="cta-box">
            <h2 class="cta-title">Acesse o BlueFox Finance</h2>
            <p class="cta-subtitle">
              Faça login para navegar pela ferramenta e gerenciar seus lançamentos, cartões e orçamentos.
            </p>
            <div class="cta-buttons">
              <a routerLink="/dashboard" class="btn-primary-action">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Fazer Login</span>
              </a>

              <a routerLink="/updates" class="btn-ghost-action">
                <span>Ver Atualizações & Roadmap</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </section>
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

    .about-page-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header Flutuante Suspenso */
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

    /* Main Container */
    .about-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3.5rem 1.5rem 5rem 1.5rem;
      width: 100%;
      box-sizing: border-box;
      flex: 1;
    }

    .about-hero {
      text-align: center;
      margin-bottom: 3.5rem;
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
      font-size: 2.8rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.025em;
      margin: 0 0 1rem 0;
      line-height: 1.15;
    }

    .page-subtitle {
      font-size: 1.15rem;
      color: #94a3b8;
      max-width: 780px;
      margin: 0 auto;
      line-height: 1.65;
    }

    .text-white { color: #ffffff; }
    .font-bold { font-weight: 700; }

    /* Grid de Conteúdo */
    .story-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }

    .story-card {
      background: linear-gradient(135deg, rgba(13, 23, 51, 0.9) 0%, rgba(8, 15, 36, 0.95) 100%);
      border: 1px solid rgba(56, 182, 255, 0.2);
      border-radius: 20px;
      padding: 2.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
      transition: all 0.25s ease;
    }

    .story-card:hover {
      border-color: rgba(56, 182, 255, 0.4);
      transform: translateY(-2px);
    }

    .story-card.full-width-card {
      grid-column: 1 / -1;
    }

    .card-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-blue {
      background: rgba(0, 74, 173, 0.25);
      color: #38b6ff;
      border: 1px solid rgba(56, 182, 255, 0.3);
    }

    .icon-teal {
      background: rgba(16, 185, 129, 0.18);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    .icon-purple {
      background: rgba(168, 85, 247, 0.18);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }

    .icon-cyan {
      background: rgba(56, 182, 255, 0.15);
      color: #38b6ff;
      border: 1px solid rgba(56, 182, 255, 0.35);
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .card-tag {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38b6ff;
    }

    .card-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.45rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
    }

    .card-text {
      font-size: 0.94rem;
      line-height: 1.65;
      color: #cbd5e1;
      margin: 0;
    }

    .card-text strong {
      color: #38b6ff;
    }

    .card-highlight-box {
      margin-top: 0.5rem;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      background: rgba(56, 182, 255, 0.05);
      border: 1px solid rgba(56, 182, 255, 0.2);
      border-radius: 12px;
      padding: 0.95rem 1.15rem;
      font-size: 0.88rem;
      color: #e2e8f0;
      line-height: 1.5;
    }

    .card-highlight-box svg {
      flex-shrink: 0;
      margin-top: 0.15rem;
    }

    /* Pilares do Grupo */
    .pillars-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    .pillar-mini-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.15rem;
    }

    .pillar-label {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.35rem;
    }

    .pillar-desc {
      font-size: 0.82rem;
      color: #94a3b8;
      line-height: 1.45;
    }

    /* Painel Explicativo Keycloak */
    .keycloak-role-card {
      border-color: rgba(56, 182, 255, 0.35);
    }

    .keycloak-explanation-panel {
      margin-top: 0.75rem;
      background: rgba(11, 19, 43, 0.7);
      border: 1px solid rgba(56, 182, 255, 0.25);
      border-radius: 16px;
      padding: 1.75rem;
    }

    .panel-header {
      margin-bottom: 0.75rem;
    }

    .panel-badge {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #38b6ff;
      background: rgba(56, 182, 255, 0.1);
      border: 1px solid rgba(56, 182, 255, 0.25);
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
    }

    .panel-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0.6rem 0 0 0;
    }

    .panel-text {
      font-size: 0.92rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0.5rem 0 1.25rem 0;
    }

    .keycloak-points-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .kpoint {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1rem;
    }

    .kpoint-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38b6ff;
      box-shadow: 0 0 6px #38b6ff;
      flex-shrink: 0;
      margin-top: 0.35rem;
    }

    .kpoint-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.82rem;
      line-height: 1.45;
      color: #94a3b8;
    }

    .kpoint-info strong {
      color: #ffffff;
      font-size: 0.86rem;
    }

    .panel-footnote {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.8rem;
      color: #64748b;
    }

    .panel-footnote svg {
      flex-shrink: 0;
    }

    /* Bottom CTA */
    .bottom-cta-section {
      margin-top: 4.5rem;
    }

    .cta-box {
      background: linear-gradient(135deg, rgba(0, 74, 173, 0.25) 0%, rgba(11, 19, 43, 0.6) 100%);
      border: 1px solid rgba(56, 182, 255, 0.25);
      border-radius: 20px;
      padding: 3rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
    }

    .cta-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.9rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .cta-subtitle {
      font-size: 0.95rem;
      color: #94a3b8;
      max-width: 560px;
      margin: 0 0 1rem 0;
    }

    .cta-buttons {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-primary-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      padding: 0.85rem 2.25rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.98rem;
      box-shadow: 0 4px 20px rgba(56, 182, 255, 0.4);
      transition: all 0.2s ease;
    }

    .btn-primary-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(56, 182, 255, 0.6);
    }

    .btn-ghost-action {
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

    .btn-ghost-action:hover {
      background: rgba(56, 182, 255, 0.1);
      border-color: #38b6ff;
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

    @media (max-width: 900px) {
      .story-grid { grid-template-columns: 1fr; }
      .pillars-row { grid-template-columns: 1fr; }
      .keycloak-points-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .public-nav { display: none; }
      .hamburger-btn { display: flex; }
      .page-title { font-size: 2rem; }
      .story-card { padding: 1.5rem 1.15rem; }
      .keycloak-explanation-panel { padding: 1.25rem 1rem; }
      .footer-container {
        flex-direction: column;
        text-align: center;
      }
    }
  `],
})
export class AboutComponent {
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
