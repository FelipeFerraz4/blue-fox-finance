import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoriesService } from '../../../services/categories.service';
import { CategoriaLoja, CreateCategoriaLojaDto, UpdateCategoriaLojaDto } from '../../../models/category.model';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-store-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmModalComponent],
  template: `
    <div class="page-layout">
      <!-- Breadcrumb & Cabeçalho -->
      <div class="page-header">
        <div class="breadcrumb-row">
          <a routerLink="/admin" class="breadcrumb-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar para Administração
          </a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Categorias de Lojas</span>
        </div>

        <div class="header-main">
          <div class="header-text">
            <div class="title-with-badge">
              <h1 class="page-title">Categorias de Lojas</h1>
              <span class="category-badge">Estabelecimentos & Fornecedores</span>
            </div>
            <p class="page-subtitle">
              Cadastre e gerencie os segmentos comerciais para classificar as lojas do sistema.
            </p>
          </div>

          <button
            type="button"
            class="btn btn-primary btn-pill shadow-glow"
            (click)="openCreateModal()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      <!-- Barra de Controle & Filtros -->
      <div class="filter-card">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Buscar categoria por nome ou descrição..."
            class="search-input"
          />
          <button *ngIf="searchTerm" (click)="searchTerm = ''" class="btn-clear-search">✕</button>
        </div>

        <div class="stats-row">
          <div class="stat-pill">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ categories.length }}</span>
          </div>
          <div class="stat-pill active">
            <span class="stat-label">Ativas:</span>
            <span class="stat-value">{{ activeCount }}</span>
          </div>
        </div>
      </div>

      <!-- Estado de Carregamento -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando categorias de lojas...</p>
      </div>

      <!-- Mensagens de Feedback -->
      <div *ngIf="successMessage" class="feedback-alert success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <div *ngIf="errorMessage" class="feedback-alert error">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Tabela de Categorias -->
      <div *ngIf="!loading" class="table-card">
        <div class="desktop-table-container">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="width: 260px;">Nome da Categoria</th>
                  <th>Descrição / Segmento</th>
                  <th style="width: 140px;">Status</th>
                  <th style="width: 120px;" class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cat of filteredCategories" class="table-row">
                  <td>
                    <div class="store-cat-name-box">
                      <div class="cat-icon-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      </div>
                      <span class="category-title">{{ cat.nome }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="category-desc">{{ cat.descricao || 'Sem descrição informada' }}</span>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-active]="cat.ativo"
                      [class.badge-inactive]="!cat.ativo"
                    >
                      {{ cat.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="btn-icon btn-edit"
                        (click)="openEditModal(cat)"
                        title="Editar Categoria"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="btn-icon btn-delete"
                        (click)="confirmDelete(cat)"
                        title="Excluir Categoria"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredCategories.length === 0" class="empty-row">
                  <td colspan="4">
                    <div class="empty-state">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <p class="empty-text">Nenhuma categoria de loja encontrada.</p>
                      <button class="btn btn-outline-primary btn-sm btn-pill" (click)="openCreateModal()">
                        Cadastrar Categoria
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cards Mobile de Categorias de Lojas -->
        <div class="mobile-cards-container" *ngIf="filteredCategories.length > 0">
          <div *ngFor="let cat of filteredCategories" class="cat-mobile-card">
            <div class="cat-card-header">
              <div class="store-cat-name-box">
                <div class="cat-icon-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span class="category-title font-bold">{{ cat.nome }}</span>
              </div>
              <span
                class="badge"
                [class.badge-active]="cat.ativo"
                [class.badge-inactive]="!cat.ativo"
              >
                {{ cat.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="cat-card-body" *ngIf="cat.descricao">
              <p class="category-desc">{{ cat.descricao }}</p>
            </div>
            <div class="cat-card-actions">
              <button
                type="button"
                class="btn btn-secondary btn-sm mobile-action-btn"
                (click)="openEditModal(cat)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Editar</span>
              </button>
              <button
                type="button"
                class="btn btn-danger btn-sm mobile-action-btn"
                (click)="confirmDelete(cat)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>

        <div class="mobile-empty-state" *ngIf="filteredCategories.length === 0">
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p class="empty-text">Nenhuma categoria de loja encontrada.</p>
            <button class="btn btn-outline-primary btn-sm btn-pill" (click)="openCreateModal()">
              Cadastrar Categoria
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Criação / Edição de Categoria de Loja -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h3 class="modal-title">{{ isEditing ? 'Editar Categoria de Loja' : 'Nova Categoria de Loja' }}</h3>
              <p class="modal-subtitle">Defina o nome e detalhes do segmento comercial</p>
            </div>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveCategory()" #catForm="ngForm">
            <div class="modal-body">
              <div class="form-group">
                <label for="storeCatNome" class="form-label">
                  Nome da Categoria / Segmento <span class="required">*</span>
                </label>
                <input
                  id="storeCatNome"
                  type="text"
                  name="nome"
                  [(ngModel)]="formData.nome"
                  required
                  placeholder="Ex: E-commerce, Supermercado, Farmácia..."
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="storeCatDesc" class="form-label">Descrição / Observações</label>
                <textarea
                  id="storeCatDesc"
                  name="descricao"
                  [(ngModel)]="formData.descricao"
                  rows="3"
                  placeholder="Ex: Plataformas de compras online e marketplaces nacionais e internacionais"
                  class="form-control"
                ></textarea>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    name="ativo"
                    [(ngModel)]="formData.ativo"
                    class="checkbox-input"
                  />
                  <span>Categoria Ativa para novas Lojas</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light btn-pill" (click)="closeModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary btn-pill shadow-glow"
                [disabled]="!formData.nome || isSaving"
              >
                {{ isSaving ? 'Salvando...' : (isEditing ? 'Atualizar Categoria' : 'Cadastrar Categoria') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação para Exclusão -->
      <app-confirm-modal
        [isOpen]="showDeleteConfirm"
        title="Excluir Categoria de Loja"
        [message]="deleteConfirmationMessage"
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        confirmType="danger"
        (confirm)="executeDelete()"
        (cancel)="showDeleteConfirm = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .page-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .breadcrumb-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #004aad;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.15s ease;
    }

    .breadcrumb-link:hover {
      color: #38b6ff;
    }

    .breadcrumb-separator {
      color: #94a3b8;
    }

    .breadcrumb-current {
      color: #64748b;
      font-weight: 500;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
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
      .breadcrumb-row {
        justify-content: center;
        text-align: center;
        flex-wrap: wrap;
        width: 100%;
      }

      .page-header {
        align-items: center;
        text-align: center;
        gap: 1rem;
      }

      .header-main {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        width: 100%;
      }

      .header-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
      }

      .title-with-badge {
        justify-content: center;
        text-align: center;
        width: 100%;
      }

      .page-title {
        font-size: 1.15rem;
        justify-content: center;
        text-align: center;
      }

      .page-subtitle {
        text-align: center;
        max-width: 520px;
        margin: 0 auto;
      }

      .header-main .btn {
        width: 100%;
        justify-content: center;
      }

      .filter-card {
        flex-direction: column;
        align-items: center;
        gap: 0.85rem;
        width: 100%;
        box-sizing: border-box;
      }

      .search-box {
        width: 100%;
        max-width: 100%;
        min-width: 0;
      }

      .stats-row {
        justify-content: center;
        width: 100%;
      }

      .feedback-alert {
        justify-content: center;
        text-align: center;
      }

      .mobile-empty-state {
        text-align: center;
        align-items: center;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.05rem;
      }
    }

    .category-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #eff6ff;
      color: #004aad;
      border: 1px solid rgba(56, 182, 255, 0.4);
      padding: 0.2rem 0.65rem;
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

    /* Card de Filtros */
    .filter-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 1rem 1.25rem;
      border: 1px solid rgba(0, 74, 173, 0.08);
      box-shadow: 0 2px 10px rgba(0, 74, 173, 0.03);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 480px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.65rem 2.2rem 0.65rem 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      font-family: var(--font-inter), sans-serif;
      transition: all 0.2s ease;
      background: #f8fafc;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      background: #ffffff;
      border-color: #38b6ff;
      box-shadow: 0 0 0 3px rgba(56, 182, 255, 0.15);
    }

    .btn-clear-search {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .stats-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .stat-pill {
      background: #f1f5f9;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      color: #475569;
      display: flex;
      gap: 0.4rem;
      font-weight: 500;
    }

    .stat-pill.active {
      background: #dcfce7;
      color: #15803d;
      font-weight: 600;
    }

    .stat-value {
      font-weight: 700;
    }

    /* Feedback Alert */
    .feedback-alert {
      padding: 0.85rem 1.25rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.9rem;
      font-weight: 500;
      animation: fadeIn 0.2s ease-out;
    }

    .feedback-alert.success {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid rgba(21, 128, 61, 0.2);
    }

    .feedback-alert.error {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid rgba(185, 28, 28, 0.2);
    }

    /* Tabela */
    .table-card {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid rgba(0, 74, 173, 0.08);
      box-shadow: 0 4px 16px rgba(0, 74, 173, 0.04);
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .custom-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .custom-table th {
      background: #f8fafc;
      padding: 0.95rem 1.25rem;
      font-family: var(--font-outfit), sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }

    .custom-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      font-size: 0.9rem;
    }

    .table-row:hover td {
      background: #f8fafc;
    }

    .store-cat-name-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .cat-icon-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #eff6ff;
      color: #004aad;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .category-title {
      font-weight: 600;
      color: #0b132b;
    }

    .category-desc {
      color: #64748b;
      font-size: 0.86rem;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 50px;
      display: inline-block;
    }

    .badge-active {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .badge-inactive {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .btn-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: #f8fafc;
      color: #64748b;
      transition: all 0.15s ease;
    }

    .btn-edit:hover {
      background: #eff6ff;
      color: #004aad;
      border-color: rgba(0, 74, 173, 0.2);
    }

    .btn-delete:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: rgba(220, 38, 38, 0.2);
    }

    .empty-state {
      padding: 3rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: #94a3b8;
    }

    .empty-text {
      margin: 0;
      font-size: 0.95rem;
      color: #64748b;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(11, 19, 43, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 40px rgba(0, 74, 173, 0.15);
      overflow: hidden;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      border-bottom: 1px solid #f1f5f9;
      position: relative;
    }

    .modal-icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.2) 0%, rgba(0, 74, 173, 0.2) 100%);
      color: #004aad;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-title {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0.2rem 0 0 0;
    }

    .modal-close {
      position: absolute;
      right: 1.25rem;
      top: 1.25rem;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.1rem;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-label {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.84rem;
      font-weight: 600;
      color: #334155;
    }

    .required {
      color: #ef4444;
    }

    .form-control {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      box-sizing: border-box;
      transition: all 0.2s ease;
      font-family: var(--font-inter), sans-serif;
    }

    .form-control:focus {
      outline: none;
      border-color: #004aad;
      box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.12);
    }

    .checkbox-group {
      margin-top: 0.25rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.88rem;
      color: #334155;
      font-weight: 500;
      cursor: pointer;
    }

    .checkbox-input {
      width: 17px;
      height: 17px;
      accent-color: #004aad;
      cursor: pointer;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }

    .loading-state {
      padding: 4rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #64748b;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(0, 74, 173, 0.15);
      border-top-color: #004aad;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsividade Desktop vs Mobile */
    .desktop-table-container {
      display: block;
    }

    .mobile-cards-container {
      display: none;
    }

    .mobile-empty-state {
      display: none;
    }

    @media (max-width: 768px) {
      .desktop-table-container {
        display: none !important;
      }

      .mobile-cards-container {
        display: flex !important;
        flex-direction: column;
        gap: 0.85rem;
        padding: 0.85rem;
      }

      .mobile-empty-state {
        display: block !important;
      }
    }

    /* Cards Mobile de Categorias */
    .cat-mobile-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0, 74, 173, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .cat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .cat-card-body {
      padding: 0.45rem 0;
      border-top: 1px dashed var(--gray-200);
      border-bottom: 1px dashed var(--gray-200);
    }

    .cat-card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .mobile-action-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: var(--radius-md);
    }
  `],
})
export class StoreCategoriesComponent implements OnInit {
  categories: CategoriaLoja[] = [];
  searchTerm = '';
  loading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  // Modal State
  showModal = false;
  isEditing = false;
  currentEditId: string | null = null;
  formData: { nome: string; descricao: string; ativo: boolean } = {
    nome: '',
    descricao: '',
    ativo: true,
  };

  // Delete State
  showDeleteConfirm = false;
  categoryToDelete: CategoriaLoja | null = null;

  constructor(private readonly categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  get deleteConfirmationMessage(): string {
    return 'Tem certeza que deseja remover a categoria "' + (this.categoryToDelete?.nome || '') + '"?';
  }

  get filteredCategories(): CategoriaLoja[] {
    if (!this.searchTerm.trim()) {
      return this.categories;
    }
    const term = this.searchTerm.toLowerCase();
    return this.categories.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        (c.descricao && c.descricao.toLowerCase().includes(term)),
    );
  }

  get activeCount(): number {
    return this.categories.filter((c) => c.ativo).length;
  }

  loadCategories(): void {
    this.loading = true;
    this.categoriesService.getStoreCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar categorias de lojas.';
        this.loading = false;
      },
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.formData = {
      nome: '',
      descricao: '',
      ativo: true,
    };
    this.showModal = true;
  }

  openEditModal(category: CategoriaLoja): void {
    this.isEditing = true;
    this.currentEditId = category.id;
    this.formData = {
      nome: category.nome,
      descricao: category.descricao || '',
      ativo: category.ativo,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCategory(): void {
    if (!this.formData.nome.trim()) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditing && this.currentEditId) {
      const dto: UpdateCategoriaLojaDto = {
        nome: this.formData.nome.trim(),
        descricao: this.formData.descricao.trim() || undefined,
        ativo: this.formData.ativo,
      };

      this.categoriesService.updateStoreCategory(this.currentEditId, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.showSuccess('Categoria de loja atualizada com sucesso!');
          this.loadCategories();
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = 'Erro ao atualizar categoria: ' + (err.error?.message || err.message);
        },
      });
    } else {
      const dto: CreateCategoriaLojaDto = {
        nome: this.formData.nome.trim(),
        descricao: this.formData.descricao.trim() || undefined,
        ativo: this.formData.ativo,
      };

      this.categoriesService.createStoreCategory(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.showSuccess('Categoria de loja cadastrada com sucesso!');
          this.loadCategories();
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = 'Erro ao cadastrar categoria: ' + (err.error?.message || err.message);
        },
      });
    }
  }

  confirmDelete(category: CategoriaLoja): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  executeDelete(): void {
    if (!this.categoryToDelete) return;

    const id = this.categoryToDelete.id;
    this.showDeleteConfirm = false;

    this.categoriesService.deleteStoreCategory(id).subscribe({
      next: () => {
        this.showSuccess('Categoria de loja removida com sucesso!');
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage = 'Erro ao excluir categoria: ' + (err.error?.message || err.message);
      },
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 3500);
  }
}
