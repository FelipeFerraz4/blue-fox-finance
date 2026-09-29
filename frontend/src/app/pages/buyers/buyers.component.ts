import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuyersService } from '../../services/buyers.service';
import { Buyer, CreateBuyerDto, UpdateBuyerDto } from '../../models/buyer.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-buyers',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="buyers-page">
      <!-- Cabeçalho da Página no Padrão Blue Fox -->
      <div class="page-header">
        <div class="page-header-content">
          <div class="header-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div class="title-with-pill">
              <h1 class="page-title">Compradores</h1>
              <span class="badge badge-brand">Gestão de Pessoas</span>
            </div>
            <p class="page-subtitle">
              Cadastre as pessoas e compradores das compras para agilizar novos lançamentos e habilitar filtros avançados
            </p>
          </div>
        </div>

        <button (click)="openAddModal()" class="btn btn-primary btn-pill add-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Adicionar Comprador</span>
        </button>
      </div>

      <!-- Cards de Métricas Rápidas (KPIs) -->
      <div class="kpi-grid">
        <div class="card kpi-card" (click)="setStatusFilter('ALL')" [class.selected]="statusFilter === 'ALL'">
          <div class="kpi-icon kpi-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Total de Compradores</span>
            <strong class="kpi-value">{{ buyers.length }}</strong>
          </div>
        </div>

        <div class="card kpi-card" (click)="setStatusFilter('ACTIVE')" [class.selected]="statusFilter === 'ACTIVE'">
          <div class="kpi-icon kpi-icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Compradores Ativos</span>
            <strong class="kpi-value text-green">{{ countActive }}</strong>
          </div>
        </div>

        <div class="card kpi-card" (click)="setStatusFilter('INACTIVE')" [class.selected]="statusFilter === 'INACTIVE'">
          <div class="kpi-icon kpi-icon-gray">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Compradores Inativos</span>
            <strong class="kpi-value text-muted">{{ countInactive }}</strong>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros & Busca Responsiva -->
      <div class="card buyer-filter-card">
        <div class="filter-search-wrap">
          <div class="search-input-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar por nome ou e-mail..."
              class="form-control search-input"
            />
            <button *ngIf="searchTerm" (click)="searchTerm = ''" class="btn-clear-search" title="Limpar busca">
              ✕
            </button>
          </div>
        </div>

        <div class="filter-pills-wrap">
          <span class="filter-pills-label">Filtrar por:</span>
          <div class="pills-scroll-container">
            <button
              (click)="setStatusFilter('ALL')"
              class="badge-filter"
              [class.active]="statusFilter === 'ALL'"
            >
              Todos ({{ buyers.length }})
            </button>
            <button
              (click)="setStatusFilter('ACTIVE')"
              class="badge-filter"
              [class.active]="statusFilter === 'ACTIVE'"
            >
              <span class="dot-status dot-active"></span>
              Ativos ({{ countActive }})
            </button>
            <button
              (click)="setStatusFilter('INACTIVE')"
              class="badge-filter"
              [class.active]="statusFilter === 'INACTIVE'"
            >
              <span class="dot-status dot-inactive"></span>
              Inativos ({{ countInactive }})
            </button>
          </div>
        </div>
      </div>

      <!-- Seção Principal de Listagem -->
      <div class="card buyers-list-card">
        <div class="card-title">
          <div class="card-title-left">
            <span>Lista de Compradores</span>
            <span class="badge badge-brand count-badge">{{ filteredBuyers.length }} cadastrados</span>
          </div>

          <div class="view-help-text" *ngIf="filteredBuyers.length > 0">
            <span class="text-xs text-muted">Toque no status para alternar entre ativo e inativo</span>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Carregando compradores...</p>
        </div>

        <!-- 1. VISÃO EM TABELA (DESKTOP: Telas >= 640px) -->
        <div class="desktop-table-container" *ngIf="!loading && filteredBuyers.length > 0">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Comprador</th>
                  <th>E-mail</th>
                  <th class="text-center">Status</th>
                  <th>Data de Cadastro</th>
                  <th class="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of filteredBuyers">
                  <td>
                    <div class="buyer-info-cell">
                      <div class="buyer-avatar">{{ getInitials(b.nome) }}</div>
                      <div>
                        <strong class="text-gray-900 font-semibold">{{ b.nome }}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div *ngIf="b.email" class="email-cell">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <a [href]="'mailto:' + b.email" class="email-link">{{ b.email }}</a>
                    </div>
                    <span *ngIf="!b.email" class="text-muted text-xs font-italic">Não informado</span>
                  </td>
                  <td class="text-center">
                    <button
                      (click)="toggleStatus(b)"
                      class="status-toggle-pill"
                      [class.active]="b.ativo"
                      [title]="b.ativo ? 'Clique para desativar' : 'Clique para ativar'"
                    >
                      <span class="dot-indicator"></span>
                      <span>{{ b.ativo ? 'Ativo' : 'Inativo' }}</span>
                    </button>
                  </td>
                  <td>
                    <span class="text-sm text-muted">
                      {{ b.createdAt | date:'dd/MM/yyyy' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="table-actions-row">
                      <button
                        (click)="openEditModal(b)"
                        class="btn-action-icon btn-action-edit"
                        title="Editar Comprador"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button
                        (click)="promptDeleteBuyer(b)"
                        class="btn-action-icon btn-action-delete"
                        title="Excluir Comprador"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        <span>Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. VISÃO EM CARDS MOBILE (Telas < 640px) -->
        <div class="mobile-cards-container" *ngIf="!loading && filteredBuyers.length > 0">
          <div *ngFor="let b of filteredBuyers" class="buyer-mobile-card">
            <div class="mobile-card-header">
              <div class="buyer-info-cell">
                <div class="buyer-avatar">{{ getInitials(b.nome) }}</div>
                <div>
                  <strong class="mobile-buyer-name">{{ b.nome }}</strong>
                  <span class="text-xs text-muted block">Cadastrado em {{ b.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>

              <button
                (click)="toggleStatus(b)"
                class="status-toggle-pill"
                [class.active]="b.ativo"
                [title]="b.ativo ? 'Clique para desativar' : 'Clique para ativar'"
              >
                <span class="dot-indicator"></span>
                <span>{{ b.ativo ? 'Ativo' : 'Inativo' }}</span>
              </button>
            </div>

            <div class="mobile-card-body" *ngIf="b.email">
              <div class="email-cell">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a [href]="'mailto:' + b.email" class="email-link">{{ b.email }}</a>
              </div>
            </div>

            <div class="mobile-card-actions">
              <button (click)="openEditModal(b)" class="btn btn-secondary btn-sm mobile-btn-action">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar
              </button>
              <button (click)="promptDeleteBuyer(b)" class="btn btn-danger btn-sm mobile-btn-action">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Excluir
              </button>
            </div>
          </div>
        </div>

        <!-- Estado Vazio -->
        <div *ngIf="!loading && filteredBuyers.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h3>Nenhum comprador encontrado</h3>
          <p class="text-muted text-sm mt-1">Não foram encontrados compradores para os filtros ou busca aplicados.</p>
          <div class="empty-state-actions mt-3">
            <button *ngIf="searchTerm || statusFilter !== 'ALL'" (click)="searchTerm = ''; setStatusFilter('ALL')" class="btn btn-secondary btn-sm">
              Limpar Filtros
            </button>
            <button (click)="openAddModal()" class="btn btn-primary btn-sm btn-pill">
              + Cadastrar Novo Comprador
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Adicionar / Editar Comprador no Padrão Blue Fox -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content modal-buyer-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-with-icon">
              <div class="icon-circle icon-circle-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h3>{{ editingId ? 'Editar Comprador' : 'Novo Comprador' }}</h3>
                <p class="modal-subtitle">Preencha as informações para registro do comprador</p>
              </div>
            </div>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveBuyer()" #modalForm="ngForm">
            <div class="modal-body">
              <div *ngIf="errorMessage" class="alert-box alert-error mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ errorMessage }}</span>
              </div>

              <div class="form-group">
                <label class="form-label">Nome Completo do Comprador *</label>
                <input
                  type="text"
                  name="nome"
                  [(ngModel)]="formData.nome"
                  required
                  class="form-control"
                  placeholder="ex: Felipe Ferraz, Maria Silva..."
                  autofocus
                />
              </div>

              <div class="form-group">
                <label class="form-label">E-mail (opcional)</label>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="formData.email"
                  class="form-control"
                  placeholder="ex: felipe@exemplo.com"
                />
                <small class="text-muted text-xs">Utilizado para identificação e notificações futuras.</small>
              </div>

              <div class="form-group status-switch-box">
                <label class="switch-container">
                  <input
                    type="checkbox"
                    name="ativo"
                    [(ngModel)]="formData.ativo"
                  />
                  <span class="switch-slider"></span>
                </label>
                <div class="switch-label-text">
                  <strong>Comprador Ativo</strong>
                  <span class="text-xs text-muted block">Disponível para seleção em novos lançamentos</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!modalForm.valid || saving"
                class="btn btn-primary btn-pill"
              >
                <span *ngIf="!saving">{{ editingId ? 'Salvar Alterações' : 'Cadastrar Comprador' }}</span>
                <span *ngIf="saving" class="btn-spinner-wrap">
                  <span class="mini-spinner"></span>
                  Salvando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação Reutilizável para Exclusão de Comprador -->
      <app-confirm-modal
        [isOpen]="showDeleteModal"
        [title]="'Excluir Comprador'"
        [message]="'Tem certeza que deseja excluir este comprador? Se houver despesas vinculadas, o nome textual será mantido nos relatórios históricos.'"
        [itemName]="buyerToDelete?.nome"
        [confirmText]="'Sim, Excluir'"
        [cancelText]="'Cancelar'"
        [variant]="'danger'"
        [loading]="deleting"
        (confirm)="confirmDeleteBuyer()"
        (cancel)="cancelDeleteBuyer()"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .buyers-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Cabeçalho */
    .page-header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(56, 182, 255, 0.35);
      flex-shrink: 0;
    }

    .title-with-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .badge-brand {
      background: #e4f0fc;
      color: #004aad;
      border: 1px solid rgba(0, 74, 173, 0.15);
      font-weight: 600;
      font-size: 0.72rem;
    }

    .add-btn {
      white-space: nowrap;
      padding: 0.65rem 1.4rem;
    }

    @media (max-width: 768px) {
      .page-header-content {
        align-items: flex-start;
      }
      .add-btn {
        width: 100%;
      }
    }

    /* KPI Grid Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .kpi-card.selected {
      border-color: #38b6ff;
      box-shadow: 0 0 0 2px rgba(56, 182, 255, 0.3);
      background: #f8fbff;
    }

    .kpi-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon-blue {
      background: #e4f0fc;
      color: #004aad;
      border: 1px solid rgba(0, 74, 173, 0.12);
    }

    .kpi-icon-green {
      background: #ecfdf5;
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .kpi-icon-gray {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #cbd5e1;
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 0.8rem;
      color: var(--gray-500);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .kpi-value {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.65rem;
      font-weight: 800;
      color: #0b132b;
      line-height: 1.1;
      margin-top: 0.2rem;
    }

    .text-green { color: #10b981 !important; }

    /* Barra de Filtros & Busca */
    .buyer-filter-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 1rem 1.25rem;
      flex-wrap: wrap;
    }

    .filter-search-wrap {
      flex: 1;
      min-width: 260px;
    }

    .search-input-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      pointer-events: none;
    }

    .search-input {
      padding-left: 2.35rem;
      padding-right: 2.2rem;
      font-size: 0.9rem;
    }

    .btn-clear-search {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--gray-400);
      font-size: 1rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.2rem;
    }

    .btn-clear-search:hover {
      color: var(--gray-700);
    }

    .filter-pills-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .filter-pills-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--gray-600);
      white-space: nowrap;
    }

    .pills-scroll-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 2px;
      -webkit-overflow-scrolling: touch;
    }

    .badge-filter {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: var(--gray-700);
      padding: 0.42rem 0.85rem;
      border-radius: 9999px;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .badge-filter:hover {
      background: #e2e8f0;
      color: #0b132b;
    }

    .badge-filter.active {
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 2px 8px rgba(56, 182, 255, 0.35);
      font-weight: 600;
    }

    .dot-status {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot-active { background-color: #10b981; }
    .dot-inactive { background-color: #94a3b8; }

    .badge-filter.active .dot-status {
      background-color: #ffffff;
    }

    @media (max-width: 768px) {
      .buyer-filter-card {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-pills-wrap {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .pills-scroll-container {
        width: 100%;
        overflow-x: auto;
      }
    }

    /* Tabela Desktop */
    .card-title-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .count-badge {
      font-size: 0.72rem;
    }

    .buyer-info-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .buyer-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #e4f0fc 0%, #dbeeff 100%);
      color: #004aad;
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0, 74, 173, 0.15);
      box-shadow: 0 2px 5px rgba(0, 74, 173, 0.05);
      flex-shrink: 0;
    }

    .email-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--gray-600);
      font-size: 0.85rem;
    }

    .email-link {
      color: #004aad;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .email-link:hover {
      color: #38b6ff;
      text-decoration: underline;
    }

    .status-toggle-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f1f5f9;
      color: #64748b;
    }

    .status-toggle-pill .dot-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #94a3b8;
    }

    .status-toggle-pill.active {
      background: #ecfdf5;
      color: #065f46;
      border-color: rgba(16, 185, 129, 0.25);
    }

    .status-toggle-pill.active .dot-indicator {
      background-color: #10b981;
    }

    .status-toggle-pill:hover {
      transform: scale(1.03);
    }

    .table-actions-row {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-action-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      border: 1px solid transparent;
      cursor: pointer;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      transition: all 0.15s ease;
    }

    .btn-action-edit {
      background: #ffffff;
      border-color: rgba(0, 74, 173, 0.2);
      color: #004aad;
    }

    .btn-action-edit:hover {
      background: #e4f0fc;
      border-color: #004aad;
      transform: translateY(-1px);
    }

    .btn-action-delete {
      background: #fee2e2;
      border-color: #fecaca;
      color: #dc2626;
    }

    .btn-action-delete:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
      transform: translateY(-1px);
    }

    /* Adaptabilidade Mobile vs Desktop */
    .mobile-cards-container {
      display: none;
    }

    @media (max-width: 640px) {
      .desktop-table-container {
        display: none;
      }

      .mobile-cards-container {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
    }

    /* Cards para Mobile (< 640px) */
    .buyer-mobile-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0, 74, 173, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .mobile-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .mobile-buyer-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1rem;
      font-weight: 700;
      color: #0b132b;
    }

    .mobile-card-body {
      padding: 0.4rem 0;
      border-top: 1px dashed var(--gray-200);
      border-bottom: 1px dashed var(--gray-200);
    }

    .mobile-card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .mobile-btn-action {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.82rem;
    }

    /* Estados de Carregamento e Vazio */
    .loading-state, .empty-state {
      padding: 2.5rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(0, 74, 173, 0.15);
      border-top-color: #38b6ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 0.75rem;
    }

    .empty-icon-wrap {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .empty-state-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Modal de Cadastro / Edição */
    .modal-buyer-dialog {
      max-width: 480px;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--gray-200);
    }

    .modal-title-with-icon {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .icon-circle {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-circle-blue {
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(56, 182, 255, 0.35);
    }

    .modal-header h3 {
      font-size: 1.2rem;
      margin: 0;
      color: #0b132b;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: var(--gray-500);
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--gray-400);
      line-height: 1;
    }

    .btn-close:hover {
      color: var(--gray-700);
    }

    .alert-box {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .alert-error {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    /* Switch Customizado para Ativo */
    .status-switch-box {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid var(--gray-200);
      margin-top: 1rem;
    }

    .switch-container {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }

    .switch-container input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #cbd5e1;
      transition: 0.25s;
      border-radius: 24px;
    }

    .switch-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.25s;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .switch-container input:checked + .switch-slider {
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
    }

    .switch-container input:checked + .switch-slider:before {
      transform: translateX(20px);
    }

    .switch-label-text strong {
      font-size: 0.9rem;
      color: #0b132b;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
    }

    .btn-spinner-wrap {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .mini-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .block { display: block; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.85rem; }
    .text-muted { color: var(--gray-500); }
    .font-italic { font-style: italic; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-3 { margin-top: 0.75rem; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class BuyersComponent implements OnInit {
  buyers: Buyer[] = [];
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  searchTerm: string = '';
  loading = true;

  // Modal State
  showModal = false;
  editingId: string | null = null;
  formData: { nome: string; email: string; ativo: boolean } = {
    nome: '',
    email: '',
    ativo: true,
  };
  saving = false;
  errorMessage = '';

  // Delete Confirm Modal State
  showDeleteModal = false;
  buyerToDelete: Buyer | null = null;
  deleting = false;

  constructor(private readonly buyersService: BuyersService) {}

  ngOnInit() {
    this.loadBuyers();
  }

  loadBuyers() {
    this.loading = true;
    this.buyersService.getAll().subscribe({
      next: (data) => {
        this.buyers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar compradores:', err);
        this.loading = false;
      },
    });
  }

  get countActive(): number {
    return this.buyers.filter((b) => b.ativo).length;
  }

  get countInactive(): number {
    return this.buyers.filter((b) => !b.ativo).length;
  }

  setStatusFilter(filter: 'ALL' | 'ACTIVE' | 'INACTIVE') {
    this.statusFilter = filter;
  }

  get filteredBuyers(): Buyer[] {
    let result = this.buyers;

    if (this.statusFilter === 'ACTIVE') {
      result = result.filter((b) => b.ativo);
    } else if (this.statusFilter === 'INACTIVE') {
      result = result.filter((b) => !b.ativo);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.nome.toLowerCase().includes(term) ||
          (b.email && b.email.toLowerCase().includes(term)),
      );
    }

    return result;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  openAddModal() {
    this.editingId = null;
    this.formData = { nome: '', email: '', ativo: true };
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(buyer: Buyer) {
    this.editingId = buyer.id;
    this.formData = {
      nome: buyer.nome,
      email: buyer.email || '',
      ativo: buyer.ativo,
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.errorMessage = '';
  }

  saveBuyer() {
    if (!this.formData.nome?.trim()) {
      this.errorMessage = 'O nome do comprador é obrigatório.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      nome: this.formData.nome.trim(),
      email: this.formData.email?.trim() || undefined,
      ativo: this.formData.ativo,
    };

    if (this.editingId) {
      this.buyersService.update(this.editingId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadBuyers();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || err.message || 'Erro ao atualizar comprador.';
        },
      });
    } else {
      this.buyersService.create(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadBuyers();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || err.message || 'Erro ao cadastrar comprador.';
        },
      });
    }
  }

  toggleStatus(buyer: Buyer) {
    this.buyersService.update(buyer.id, { ativo: !buyer.ativo }).subscribe({
      next: () => this.loadBuyers(),
      error: (err) => alert('Erro ao alterar status: ' + err.message),
    });
  }

  promptDeleteBuyer(buyer: Buyer) {
    this.buyerToDelete = buyer;
    this.showDeleteModal = true;
  }

  cancelDeleteBuyer() {
    this.showDeleteModal = false;
    this.buyerToDelete = null;
  }

  confirmDeleteBuyer() {
    if (!this.buyerToDelete) return;
    this.deleting = true;
    this.buyersService.delete(this.buyerToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.buyerToDelete = null;
        this.loadBuyers();
      },
      error: (err) => {
        this.deleting = false;
        alert('Erro ao excluir comprador: ' + (err.error?.message || err.message));
      },
    });
  }
}
