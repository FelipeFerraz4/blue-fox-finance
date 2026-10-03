import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, UserProfile, SystemAvatar } from '../../services/user.service';

interface AdminModuleCard {
  title: string;
  category: string;
  description: string;
  route: string;
  badge?: string;
  badgeType?: 'primary' | 'cyan' | 'warning' | 'success';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <!-- Cabeçalho Principal do Hub -->
      <div class="admin-header">
        <div class="header-titles">
          <div class="title-with-pill">
            <h1 class="page-title">Central de Administração</h1>
            <span class="hub-pill">Hub Geral do Sistema</span>
          </div>
          <p class="page-subtitle">
            Gerencie módulos, categorias de despesas, lojas, cadastros essenciais e credenciais de acesso.
          </p>
        </div>
      </div>

      <!-- CARD DE PERFIL DO USUÁRIO (OVERVIEW) -->
      <section class="user-overview-card">
        <div class="user-overview-content">
          <div class="user-avatar-wrap">
            <div
              class="user-avatar-circle"
              [style.background]="'linear-gradient(135deg, ' + currentAvatar.color + ' 0%, #0b132b 100%)'"
            >
              <svg *ngIf="currentAvatar.iconType === 'fox-blue'" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-cyan'" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-shield'" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-star'" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-bolt'" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <svg *ngIf="currentAvatar.iconType === 'fox-chart'" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <span class="avatar-online-dot"></span>
          </div>

          <div class="user-details-group">
            <div class="user-name-row">
              <h2 class="user-full-name">{{ profile.name }}</h2>
              <span class="user-role-badge">{{ profile.role }}</span>
            </div>

            <div class="user-meta-row">
              <div class="meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>&#64;{{ profile.username }}</span>
              </div>

              <div class="meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{{ profile.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="user-overview-actions">
          <a routerLink="/admin/usuario" class="btn btn-primary btn-pill shadow-glow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Configurar Usuário & Avatar</span>
          </a>
        </div>
      </section>

      <!-- SEÇÃO DE MÓDULOS E CARDS DE NAVEGAÇÃO -->
      <div class="section-divider">
        <h3 class="section-title">Módulos do Sistema</h3>
        <p class="section-desc">Acesso direto a todas as telas operacionais, relatórios e configurações</p>
      </div>

      <div class="modules-grid">
        <a
          *ngFor="let card of moduleCards"
          [routerLink]="card.route"
          class="module-card"
        >
          <div class="card-top">
            <div class="module-icon-wrap" [style.backgroundColor]="card.color + '15'" [style.color]="card.color">
              <svg *ngIf="card.icon === 'tag'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <svg *ngIf="card.icon === 'store'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <svg *ngIf="card.icon === 'user'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <svg *ngIf="card.icon === 'list'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <svg *ngIf="card.icon === 'plus-circle'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <svg *ngIf="card.icon === 'card'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <svg *ngIf="card.icon === 'buyers'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <svg *ngIf="card.icon === 'chart'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="9"/>
                <rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/>
                <rect x="3" y="16" width="7" height="5"/>
              </svg>
            </div>

            <span *ngIf="card.badge" class="card-badge" [ngClass]="card.badgeType || 'primary'">
              {{ card.badge }}
            </span>
          </div>

          <div class="card-content">
            <span class="card-category">{{ card.category }}</span>
            <h4 class="card-heading">{{ card.title }}</h4>
            <p class="card-description">{{ card.description }}</p>
          </div>

          <div class="card-bottom">
            <span class="card-action-text">Acessar página</span>
            <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    /* Cabeçalho */
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
    }

    .title-with-pill {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      color: #0b132b;
      margin: 0;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 1.15rem;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.05rem;
      }
    }

    .hub-pill {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #eff6ff;
      color: #004aad;
      border: 1px solid rgba(56, 182, 255, 0.4);
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .page-subtitle {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.88rem;
      color: #64748b;
      margin: 0.15rem 0 0 0;
    }

    /* Card de Visão Geral do Usuário */
    .user-overview-card {
      background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
      border-radius: 18px;
      border: 1px solid rgba(0, 74, 173, 0.15);
      padding: 1.75rem 2rem;
      box-shadow: 0 4px 20px rgba(0, 74, 173, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .user-overview-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .user-avatar-wrap {
      position: relative;
    }

    .user-avatar-circle {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 18px rgba(0, 74, 173, 0.25);
      border: 3px solid #ffffff;
    }

    .avatar-online-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #ffffff;
    }

    .user-details-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .user-name-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .user-full-name {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
    }

    .user-role-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #004aad;
      color: #ffffff;
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
    }

    .user-meta-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.86rem;
      color: #475569;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .user-overview-actions {
      display: flex;
      align-items: center;
    }

    /* Divisor de Seção */
    .section-divider {
      margin-top: 0.5rem;
    }

    .section-title {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
    }

    .section-desc {
      font-size: 0.88rem;
      color: #64748b;
      margin: 0.25rem 0 0 0;
    }

    /* Grid de Módulos */
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      width: 100%;
      box-sizing: border-box;
    }

    .module-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid rgba(0, 74, 173, 0.08);
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 74, 173, 0.03);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .module-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 74, 173, 0.09);
      border-color: rgba(56, 182, 255, 0.4);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }

    .module-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .module-card:hover .module-icon-wrap {
      transform: scale(1.08);
    }

    .card-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.2rem 0.55rem;
      border-radius: 50px;
      white-space: nowrap;
    }

    .card-badge.primary {
      background: #eff6ff;
      color: #004aad;
      border: 1px solid rgba(0, 74, 173, 0.2);
    }

    .card-badge.cyan {
      background: #e0f2fe;
      color: #0284c7;
      border: 1px solid rgba(2, 132, 199, 0.2);
    }

    .card-badge.warning {
      background: #fef3c7;
      color: #d97706;
      border: 1px solid rgba(217, 119, 6, 0.2);
    }

    .card-badge.success {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid rgba(21, 128, 61, 0.2);
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .card-category {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
    }

    .card-heading {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
      transition: color 0.15s ease;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .module-card:hover .card-heading {
      color: #004aad;
    }

    .card-description {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.86rem;
      line-height: 1.45;
      color: #64748b;
      margin: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.85rem;
      border-top: 1px solid #f8fafc;
      font-size: 0.82rem;
      font-weight: 600;
      color: #004aad;
    }

    .arrow-icon {
      transition: transform 0.2s ease;
    }

    .module-card:hover .arrow-icon {
      transform: translateX(4px);
    }

    @media (max-width: 768px) {
      .admin-page {
        gap: 1.25rem;
      }

      .admin-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        width: 100%;
      }

      .header-titles {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
      }

      .title-with-pill {
        justify-content: center;
        text-align: center;
        width: 100%;
      }

      .page-title {
        justify-content: center;
        text-align: center;
      }

      .page-subtitle {
        text-align: center;
        max-width: 520px;
        margin: 0 auto;
      }

      .user-overview-card {
        padding: 1.5rem 1rem;
        width: 100%;
        box-sizing: border-box;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.25rem;
      }

      .user-overview-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        width: 100%;
        min-width: 0;
      }

      .user-avatar-wrap {
        margin: 0 auto;
      }

      .user-details-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-width: 0;
        width: 100%;
      }

      .user-name-row {
        justify-content: center;
        text-align: center;
        width: 100%;
      }

      .user-full-name {
        font-size: 1.2rem;
        word-break: break-word;
        text-align: center;
      }

      .user-meta-row {
        gap: 0.75rem;
        justify-content: center;
        text-align: center;
        width: 100%;
      }

      .meta-item {
        min-width: 0;
        overflow-wrap: anywhere;
        justify-content: center;
      }

      .user-overview-actions {
        width: 100%;
        justify-content: center;
      }

      .user-overview-actions .btn {
        width: 100%;
        justify-content: center;
      }

      .section-divider {
        text-align: center;
        width: 100%;
      }

      .section-title {
        text-align: center;
      }

      .section-desc {
        text-align: center;
      }

      .modules-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
      }

      .module-card {
        padding: 1.25rem 1rem;
      }
    }

    @media (max-width: 480px) {
      .user-avatar-circle {
        width: 64px;
        height: 64px;
      }

      .module-icon-wrap {
        width: 42px;
        height: 42px;
      }

      .module-card {
        padding: 1.1rem 0.9rem;
      }
    }
  `],
})
export class AdminComponent implements OnInit {
  profile: UserProfile;
  currentAvatar: SystemAvatar;

  moduleCards: AdminModuleCard[] = [
    {
      title: 'Categorias de Itens',
      category: 'Classificação de Despesas',
      description: 'Gerenciamento completo das categorias de itens e produtos com cores personalizadas.',
      route: '/admin/categorias-itens',
      badge: 'Gerenciador',
      badgeType: 'primary',
      icon: 'tag',
      color: '#004aad',
    },
    {
      title: 'Categorias de Lojas',
      category: 'Segmentos Comerciais',
      description: 'Classificação de lojas e fornecedores (E-commerce, Farmácia, Supermercados, etc).',
      route: '/admin/categorias-lojas',
      badge: 'Gerenciador',
      badgeType: 'cyan',
      icon: 'store',
      color: '#0284c7',
    },
    {
      title: 'Perfil & Configurações de Usuário',
      category: 'Segurança & Identidade',
      description: 'Edição de nome, e-mail, telefone, username e avatar oficial do sistema.',
      route: '/admin/usuario',
      badge: 'Minha Conta',
      badgeType: 'warning',
      icon: 'user',
      color: '#d97706',
    },
    {
      title: 'Lançamentos Financeiros',
      category: 'Operacional',
      description: 'Histórico completo, filtros por período e status, visualização de parcelas e relatórios.',
      route: '/lancamentos',
      badge: 'Financeiro',
      badgeType: 'primary',
      icon: 'list',
      color: '#004aad',
    },
    {
      title: 'Novo Lançamento Agrupado',
      category: 'Operacional',
      description: 'Inserção ágil com cabeçalho comum (comprador, loja, data) e múltiplos cards de compras.',
      route: '/lancamentos/novo',
      badge: 'Agilizado',
      badgeType: 'success',
      icon: 'plus-circle',
      color: '#10b981',
    },
    {
      title: 'Compradores',
      category: 'Cadastros Base',
      description: 'Cadastro e gestão de titulares e responsáveis pelas despesas e faturas.',
      route: '/compradores',
      icon: 'buyers',
      color: '#6366f1',
    },
    {
      title: 'Lojas & Estabelecimentos',
      category: 'Cadastros Base',
      description: 'Registro de lojas físicas, plataformas virtuais e fornecedores com categoria associada.',
      route: '/lojas',
      icon: 'store',
      color: '#8b5cf6',
    },
    {
      title: 'Meios de Pagamento',
      category: 'Cadastros Base',
      description: 'Configuração de cartões de crédito, contas bancárias e outras modalidades financeiras.',
      route: '/meios-pagamento',
      icon: 'card',
      color: '#ec4899',
    },
    {
      title: 'Dashboard Financeiro',
      category: 'Visão Geral & Indicadores',
      description: 'Métricas em tempo real, despesas do mês, gastos por categoria e gráficos analíticos.',
      route: '/dashboard',
      icon: 'chart',
      color: '#38b6ff',
    },
  ];

  constructor(public readonly userService: UserService) {
    this.profile = this.userService.currentProfile;
    this.currentAvatar = this.userService.getAvatarById(this.profile.avatarId);
  }

  ngOnInit(): void {
    this.userService.profile$.subscribe((p) => {
      this.profile = p;
      this.currentAvatar = this.userService.getAvatarById(p.avatarId);
    });
  }
}
