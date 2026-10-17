import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoresService } from '../../../core/services/stores/stores.service';
import { ExpensePreferencesService } from '../../../core/services/expense-preferences/expense-preferences.service';
import { CategoriesService } from '../../../core/services/categories/categories.service';
import { Store, CreateStoreDto } from '../../../shared/model/types/store.model';
import { CategoriaLoja } from '../../../shared/model/types/category.model';
import { ConfirmModalComponent } from '../../../shared/components/general/confirm-modal/confirm-modal.component';
import { SearchableDropdownComponent } from '../../../shared/components/general/searchable-dropdown';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, SearchableDropdownComponent],
  template: `
    <div class="stores-page">
      <div class="page-header">
        <div class="page-header-content">
          <div class="title-with-pill">
            <div class="header-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h1 class="page-title">Lojas & Estabelecimentos</h1>
            <span class="badge badge-brand">Locais de Compra</span>
          </div>
          <p class="page-subtitle">
            Cadastre as lojas e suas categorias para agilizar o preenchimento de lançamentos e permitir filtros refinados
          </p>
        </div>

        <button (click)="openAddModal()" class="btn btn-primary btn-pill add-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Adicionar Loja</span>
        </button>
      </div>

      <!-- Filtros por Categoria de Loja -->
      <div class="card category-filter-bar">
        <span class="filter-title">Categorias:</span>
        <button
          (click)="filterCategory('')"
          class="badge-filter"
          [class.active]="selectedCategory === ''"
        >
          Todas ({{ stores.length }})
        </button>
        <button
          *ngFor="let cat of categories"
          (click)="filterCategory(cat)"
          class="badge-filter"
          [class.active]="selectedCategory === cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Tabela de Lojas Cadastradas -->
      <div class="card">
        <div class="card-title">
          <span>Lojas Cadastradas</span>
          <span class="badge badge-primary">{{ filteredStores.length }} lojas exibidas</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Carregando lojas...</p>
        </div>

        <div *ngIf="!loading && filteredStores.length > 0">
          <div class="desktop-table-container">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nome da Loja</th>
                    <th>Categoria</th>
                    <th>Data de Cadastro</th>
                    <th class="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of filteredStores">
                    <td>
                      <div class="store-info-cell">
                        <strong class="text-gray-900 font-semibold">{{ s.nome }}</strong>
                        <span *ngIf="isStoreDefault(s.id)" class="badge-default-pill">★ Padrão</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getCategoryBadgeClass(s.categoria)">
                        {{ s.categoria || 'Não categorizado' }}
                      </span>
                    </td>
                    <td>{{ s.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td class="text-center">
                      <div class="table-actions-row">
                        <button
                          (click)="openEditModal(s)"
                          class="btn btn-outline btn-sm"
                          title="Editar Loja"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Editar
                        </button>
                        <button
                          (click)="promptDeleteStore(s)"
                          class="btn btn-danger btn-sm"
                          title="Excluir Loja"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Cards Mobile de Lojas -->
          <div class="mobile-cards-container">
            <div *ngFor="let s of filteredStores" class="store-mobile-card">
              <div class="store-card-header">
                <div>
                  <span class="store-card-name">{{ s.nome }}</span>
                  <span *ngIf="isStoreDefault(s.id)" class="badge-default-pill">★ Padrão</span>
                </div>
                <span class="badge" [ngClass]="getCategoryBadgeClass(s.categoria)">
                  {{ s.categoria || 'Não categorizado' }}
                </span>
              </div>
              <div class="store-card-body">
                <span class="text-muted text-xs">Cadastrado em:</span>
                <span class="font-medium text-xs">{{ s.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="store-card-actions">
                <button
                  (click)="openEditModal(s)"
                  class="btn btn-outline btn-sm mr-2"
                  title="Editar Loja"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Editar</span>
                </button>
                <button
                  (click)="promptDeleteStore(s)"
                  class="btn btn-danger btn-sm mobile-store-delete-btn"
                  title="Excluir Loja"
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
        </div>

        <div *ngIf="!loading && filteredStores.length === 0" class="empty-state">
          <p>Nenhuma loja cadastrada para o filtro selecionado.</p>
          <button (click)="openAddModal()" class="btn btn-primary btn-sm mt-3">+ Cadastrar Nova Loja</button>
        </div>
      </div>

      <!-- Modal de Adicionar Loja -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId ? 'Editar Loja' : 'Adicionar Nova Loja' }}</h3>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveStore()" #modalForm="ngForm">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nome da Loja *</label>
                <input
                  type="text"
                  name="nome"
                  [(ngModel)]="newStore.nome"
                  required
                  class="form-control"
                  placeholder="ex: Amazon, Carrefour, Supermercado Extra, Farmácia São Paulo..."
                />
              </div>

              <div class="form-group">
                <label class="form-label">Categoria</label>
                <app-searchable-dropdown
                  [options]="categoryOptions"
                  [(ngModel)]="newStore.categoria"
                  name="categoria"
                  placeholder="Selecione ou busque uma categoria..."
                  searchPlaceholder="Pesquisar categoria..."
                  [allowCreate]="true"
                  createOptionText="+ Criar nova categoria:"
                  (createNew)="newStore.categoria = $event"
                ></app-searchable-dropdown>
              </div>

              <div class="form-group status-switch-box">
                <label class="switch-container">
                  <input
                    type="checkbox"
                    name="definirComoPadrao"
                    [(ngModel)]="definirComoPadrao"
                  />
                  <span class="switch-slider"></span>
                </label>
                <div class="switch-label-text">
                  <strong>Definir como loja padrão</strong>
                  <span class="text-xs text-muted block">Será pré-selecionada automaticamente ao abrir novos lançamentos</span>
                </div>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button
                type="submit"
                [disabled]="!modalForm.valid || saving"
                class="btn btn-primary"
              >
                {{ saving ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Cadastrar Loja') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação Reutilizável para Exclusão de Loja -->
      <app-confirm-modal
        [isOpen]="showDeleteModal"
        [title]="'Excluir Loja'"
        [message]="'Tem certeza que deseja excluir esta loja? Ela deixará de aparecer nas opções de seleção de novos lançamentos.'"
        [itemName]="storeToDelete?.nome"
        [confirmText]="'Sim, Excluir'"
        [cancelText]="'Cancelar'"
        [variant]="'danger'"
        [loading]="deleting"
        (confirm)="confirmDeleteStore()"
        (cancel)="cancelDeleteStore()"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .stores-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .badge-default-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.15rem 0.55rem;
      border-radius: 50px;
      background: rgba(245, 158, 11, 0.12);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.35);
      margin-left: 0.5rem;
      vertical-align: middle;
    }

    .store-info-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .table-actions-row {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

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

    .page-header-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.35rem;
    }

    .header-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(56, 182, 255, 0.35);
      flex-shrink: 0;
    }

    .header-icon-box svg {
      width: 20px;
      height: 20px;
    }

    .title-with-pill {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .badge-brand {
      background: #e4f0fc;
      color: #004aad;
      border: 1px solid rgba(0, 74, 173, 0.15);
      font-weight: 600;
      font-size: 0.72rem;
      white-space: nowrap;
    }

    .add-btn {
      white-space: nowrap;
      padding: 0.65rem 1.4rem;
    }

    @media (max-width: 768px) {
      .header-icon-box {
        width: 34px;
        height: 34px;
        border-radius: 8px;
      }
      .header-icon-box svg {
        width: 18px;
        height: 18px;
      }
      .title-with-pill {
        gap: 0.5rem;
      }
      .add-btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .header-icon-box {
        width: 30px;
        height: 30px;
        border-radius: 7px;
      }
      .header-icon-box svg {
        width: 16px;
        height: 16px;
      }
    }

    .category-filter-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding: 0.85rem 1.25rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .filter-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--gray-600);
      margin-right: 0.25rem;
      white-space: nowrap;
    }

    .badge-filter {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: var(--gray-700);
      padding: 0.4rem 0.85rem;
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

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--gray-200);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--gray-400);
    }

    .text-center { text-align: center !important; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }

    /* Responsividade Desktop vs Mobile */
    .desktop-table-container {
      display: block;
    }

    .mobile-cards-container {
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
      }
    }

    /* Cards Mobile de Lojas */
    .store-mobile-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0, 74, 173, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .store-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .store-card-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.05rem;
      font-weight: 700;
      color: #0b132b;
    }

    .store-card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.45rem 0;
      border-top: 1px dashed var(--gray-200);
      border-bottom: 1px dashed var(--gray-200);
    }

    .store-card-actions {
      display: flex;
      margin-top: 0.25rem;
    }

    .mobile-store-delete-btn {
      width: 100%;
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
export class StoresComponent implements OnInit {
  stores: Store[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading: boolean = true;
  showModal: boolean = false;
  saving: boolean = false;
  editingId: string | null = null;
  definirComoPadrao: boolean = false;

  newStore: CreateStoreDto = {
    nome: '',
    categoria: '',
  };

  registeredCategories: CategoriaLoja[] = [];

  get categoryOptions(): string[] {
    const defaults = [
      'Supermercado',
      'E-commerce',
      'Farmácia',
      'Eletrônicos & Informática',
      'Restaurante & Alimentação',
      'Vestuário & Calçados',
      'Casa & Decoração',
      'Serviços',
      'Outros',
    ];
    const registered = this.registeredCategories.map((c) => c.nome);
    const existing = this.categories;
    return Array.from(new Set([...registered, ...existing, ...defaults])).filter(Boolean);
  }

  constructor(
    private readonly storesService: StoresService,
    private readonly categoriesService: CategoriesService,
    private readonly preferencesService: ExpensePreferencesService,
  ) {}

  ngOnInit() {
    this.loadStores();
    this.loadCategories();
    this.loadRegisteredCategories();
    this.preferencesService.loadPreferences().subscribe({ error: () => {} });
  }

  isStoreDefault(id: string): boolean {
    return this.preferencesService.currentPreferences?.lojaPadraoId === id;
  }

  loadRegisteredCategories() {
    this.categoriesService.getStoreCategories(true).subscribe({
      next: (cats) => (this.registeredCategories = cats),
      error: (err) => console.error('Erro ao buscar categorias registradas de lojas:', err),
    });
  }

  loadStores() {
    this.loading = true;
    this.storesService.getAll().subscribe({
      next: (data) => {
        this.stores = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar lojas:', err);
        this.loading = false;
      },
    });
  }

  loadCategories() {
    this.storesService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => console.error('Erro ao buscar categorias:', err),
    });
  }

  get filteredStores(): Store[] {
    if (!this.selectedCategory) {
      return this.stores;
    }
    return this.stores.filter(
      (s) => s.categoria?.toLowerCase() === this.selectedCategory.toLowerCase(),
    );
  }

  filterCategory(cat: string) {
    this.selectedCategory = cat;
  }

  getCategoryBadgeClass(cat?: string | null): string {
    if (!cat) return 'badge-gray';
    const c = cat.toLowerCase();
    if (c.includes('supermercado')) return 'badge-success';
    if (c.includes('farmácia')) return 'badge-danger';
    if (c.includes('eletr')) return 'badge-primary';
    if (c.includes('commerce')) return 'badge-warning';
    return 'badge-primary';
  }

  openAddModal() {
    this.editingId = null;
    this.newStore = {
      nome: '',
      categoria: '',
    };
    this.definirComoPadrao = false;
    this.showModal = true;
  }

  openEditModal(store: Store) {
    this.editingId = store.id;
    this.newStore = {
      nome: store.nome,
      categoria: store.categoria || '',
    };
    this.definirComoPadrao = this.isStoreDefault(store.id);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.definirComoPadrao = false;
  }

  saveStore() {
    if (!this.newStore.nome.trim()) return;

    this.saving = true;

    if (this.editingId) {
      const id = this.editingId;
      this.storesService.update(id, this.newStore).subscribe({
        next: () => {
          if (this.definirComoPadrao) {
            this.preferencesService.setDefaultStore(id).subscribe({ error: () => {} });
          } else if (this.isStoreDefault(id)) {
            this.preferencesService.setDefaultStore(null).subscribe({ error: () => {} });
          }
          this.saving = false;
          this.closeModal();
          this.loadStores();
          this.loadCategories();
        },
        error: (err) => {
          this.saving = false;
          alert('Erro ao atualizar loja: ' + (err.error?.message || err.message));
        },
      });
    } else {
      this.storesService.create(this.newStore).subscribe({
        next: (created) => {
          if (this.definirComoPadrao && created?.id) {
            this.preferencesService.setDefaultStore(created.id).subscribe({ error: () => {} });
          }
          this.saving = false;
          this.closeModal();
          this.loadStores();
          this.loadCategories();
        },
        error: (err) => {
          this.saving = false;
          alert('Erro ao salvar loja: ' + (err.error?.message || err.message));
        },
      });
    }
  }

  showDeleteModal = false;
  storeToDelete: Store | null = null;
  deleting = false;

  promptDeleteStore(store: Store) {
    this.storeToDelete = store;
    this.showDeleteModal = true;
  }

  cancelDeleteStore() {
    this.showDeleteModal = false;
    this.storeToDelete = null;
  }

  confirmDeleteStore() {
    if (!this.storeToDelete) return;
    this.deleting = true;
    this.storesService.delete(this.storeToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.storeToDelete = null;
        this.loadStores();
        this.loadCategories();
      },
      error: (err) => {
        this.deleting = false;
        alert('Erro ao excluir loja: ' + err.message);
      },
    });
  }
}
