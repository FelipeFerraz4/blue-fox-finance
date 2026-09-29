import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Barra Lateral Interna (Fundo claro #f8fafc e Toggle no Topo) -->
    <aside
      class="internal-sidebar"
      [class.collapsed]="sidebarService.isCollapsed$ | async"
    >
      <!-- TOPO DA SIDEBAR: Mecanismo de Abrir e Fechar no Topo -->
      <div class="sidebar-top-bar">
        <div class="top-title" *ngIf="!(sidebarService.isCollapsed$ | async)">
          <span class="nav-title-label">Menu de Navegação</span>
        </div>

        <!-- Botão Toggle de Abrir/Fechar no Topo -->
        <button
          type="button"
          class="btn-toggle-top"
          (click)="sidebarService.toggleCollapse()"
          [title]="(sidebarService.isCollapsed$ | async) ? 'Expandir Menu' : 'Recolher Menu'"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            [class.rotate-180]="sidebarService.isCollapsed$ | async"
          >
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      <!-- Links de Navegação Agrupados por Importância -->
      <div class="sidebar-body">
        <!-- SEÇÃO 1: PRINCIPAL / OPERACIONAL (Topo) -->
        <div class="nav-group">
          <div class="group-title" *ngIf="!(sidebarService.isCollapsed$ | async)">
            Principal
          </div>

          <nav class="nav-list">
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Dashboard' : null"
            >
              <div class="link-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="9"/>
                  <rect x="14" y="3" width="7" height="5"/>
                  <rect x="14" y="12" width="7" height="9"/>
                  <rect x="3" y="16" width="7" height="5"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Dashboard</span>
            </a>

            <a
              routerLink="/lancamentos"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: true}"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Lançamentos' : null"
            >
              <div class="link-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Lançamentos</span>
            </a>

            <a
              routerLink="/lancamentos/novo"
              routerLinkActive="active"
              class="nav-link highlight-action"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Novo Lançamento' : null"
            >
              <div class="link-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span class="link-text font-bold" *ngIf="!(sidebarService.isCollapsed$ | async)">Novo Lançamento</span>
            </a>
          </nav>
        </div>

        <!-- SEÇÃO 2: CADASTROS BASE (2ª Seção, acima de Administrativo) -->
        <div class="nav-group">
          <div class="group-title" *ngIf="!(sidebarService.isCollapsed$ | async)">
            Cadastros Base
          </div>

          <nav class="nav-list">
            <!-- 1. Compradores -->
            <a
              routerLink="/compradores"
              routerLinkActive="active"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Compradores' : null"
            >
              <div class="link-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Compradores</span>
            </a>

            <!-- 2. Lojas & Estabelecimentos -->
            <a
              routerLink="/lojas"
              routerLinkActive="active"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Lojas & Estabelecimentos' : null"
            >
              <div class="link-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Lojas</span>
            </a>

            <!-- 3. Meios de Pagamento -->
            <a
              routerLink="/meios-pagamento"
              routerLinkActive="active"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Meios de Pagamento' : null"
            >
              <div class="link-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Meios de Pagamento</span>
            </a>

            <!-- 4. Categorias de Itens -->
            <a
              routerLink="/admin/categorias-itens"
              routerLinkActive="active"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Categorias de Itens' : null"
            >
              <div class="link-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Cat. de Itens</span>
            </a>

            <!-- 5. Categorias de Lojas -->
            <a
              routerLink="/admin/categorias-lojas"
              routerLinkActive="active"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Categorias de Lojas' : null"
            >
              <div class="link-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Cat. de Lojas</span>
            </a>
          </nav>
        </div>

        <!-- SEÇÃO 3: ADMINISTRATIVO (3ª Seção, abaixo de Cadastros Base) -->
        <div class="nav-group">
          <div class="group-title" *ngIf="!(sidebarService.isCollapsed$ | async)">
            Administrativo
          </div>

          <nav class="nav-list">
            <!-- 1. Painel Admin -->
            <a
              routerLink="/admin"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: true}"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Painel Admin' : null"
            >
              <div class="link-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Painel Admin</span>
              <span class="badge-mini" *ngIf="!(sidebarService.isCollapsed$ | async)">Hub</span>
            </a>

            <!-- 2. Perfil do Usuário -->
            <a
              routerLink="/admin/usuario"
              routerLinkActive="active"
              class="nav-link"
              [attr.data-tooltip]="(sidebarService.isCollapsed$ | async) ? 'Perfil do Usuário' : null"
            >
              <div class="link-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span class="link-text" *ngIf="!(sidebarService.isCollapsed$ | async)">Perfil do Usuário</span>
            </a>
          </nav>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    /* Sidebar Interna com cor de fundo #f8fafc (igual à página) */
    .internal-sidebar {
      width: 250px;
      background-color: #f8fafc;
      border-right: 1px solid rgba(0, 74, 173, 0.09);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: sticky;
      top: 61px; /* Logo abaixo da navbar */
      height: calc(100vh - 61px);
      box-sizing: border-box;
      z-index: 900;
    }

    /* Estado Recolhido */
    .internal-sidebar.collapsed {
      width: 68px;
    }

    /* Topo da Sidebar com Mecanismo de Abrir e Fechar */
    .sidebar-top-bar {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.85rem;
      border-bottom: 1px solid rgba(0, 74, 173, 0.07);
      background-color: #f1f5f9;
      flex-shrink: 0;
    }

    .internal-sidebar.collapsed .sidebar-top-bar {
      justify-content: center;
      padding: 0;
    }

    .nav-title-label {
      font-family: var(--font-outfit), sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #004aad;
    }

    /* Botão Toggle no Topo */
    .btn-toggle-top {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid rgba(0, 74, 173, 0.15);
      color: #004aad;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 74, 173, 0.05);
      transition: all 0.18s ease;
      flex-shrink: 0;
    }

    .btn-toggle-top:hover {
      background: #eff6ff;
      border-color: #004aad;
      transform: scale(1.05);
    }

    .rotate-180 {
      transform: rotate(180deg);
    }

    /* Corpo dos Links - Seções juntas sem espaçamento forçado ao fundo */
    .sidebar-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 1rem 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem; /* Seções próximas e consistentes */
    }

    .sidebar-body::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-body::-webkit-scrollbar-thumb {
      background: rgba(0, 74, 173, 0.15);
      border-radius: 4px;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .group-title {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #94a3b8;
      padding: 0 0.65rem;
      margin-bottom: 0.25rem;
      white-space: nowrap;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    /* Estilo dos Links */
    .nav-link {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border-radius: 10px;
      color: #475569;
      text-decoration: none;
      font-family: var(--font-inter), sans-serif;
      font-size: 0.86rem;
      font-weight: 500;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: #eff6ff;
      color: #004aad;
    }

    .nav-link.active {
      background: #eff6ff;
      color: #004aad;
      font-weight: 700;
      box-shadow: inset 3px 0 0 #004aad, 0 2px 8px rgba(0, 74, 173, 0.06);
    }

    .nav-link.active .link-icon {
      color: #004aad;
    }

    .link-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      flex-shrink: 0;
      transition: color 0.15s ease;
    }

    .link-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge-mini {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #eff6ff;
      color: #004aad;
      border: 1px solid rgba(0, 74, 173, 0.2);
      padding: 0.1rem 0.4rem;
      border-radius: 50px;
    }

    .highlight-action {
      background: #eff6ff;
      color: #004aad;
      border: 1px dashed rgba(0, 74, 173, 0.25);
    }

    .highlight-action:hover {
      background: #004aad;
      color: #ffffff;
      border-color: #004aad;
    }

    .highlight-action:hover .link-icon {
      color: #ffffff;
    }

    /* Tooltip quando recolhido */
    .internal-sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 0.65rem 0;
    }

    .internal-sidebar.collapsed .nav-link[data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: #0b132b;
      color: #ffffff;
      border: 1px solid #38b6ff;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
      z-index: 1050;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      pointer-events: none;
    }

    @media (max-width: 768px) {
      .internal-sidebar {
        display: none;
      }
    }
  `],
})
export class SidebarComponent {
  constructor(public readonly sidebarService: SidebarService) {}
}
