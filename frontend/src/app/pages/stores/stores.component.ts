import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoresService } from '../../services/stores.service';
import { CategoriesService } from '../../services/categories.service';
import { Store, CreateStoreDto } from '../../models/store.model';
import { CategoriaLoja } from '../../models/category.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="stores-page">
      <div class="page-header">
        <div class="page-header-content">
          <div class="header-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div class="title-with-pill">
              <h1 class="page-title">Lojas & Estabelecimentos</h1>
              <span class="badge badge-brand">Locais de Compra</span>
            </div>
            <p class="page-subtitle">
              Cadastre as lojas e suas categorias para agilizar o preenchimento de lançamentos e permitir filtros refinados
            </p>
          </div>
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

        <div class="table-responsive" *ngIf="!loading && filteredStores.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome da Loja</th>
                <th>Categoria do Estabelecimento</th>
                <th>Data de Cadastro</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of filteredStores">
                <td>
                  <strong class="text-gray-900 font-semibold">{{ s.nome }}</strong>
                </td>
                <td>
                  <span class="badge" [ngClass]="getCategoryBadgeClass(s.categoria)">
                    {{ s.categoria || 'Não categorizado' }}
                  </span>
                </td>
                <td>{{ s.createdAt | date:'dd/MM/yyyy' }}</td>
                <td class="text-center">
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
                </td>
              </tr>
            </tbody>
          </table>
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
            <h3>Adicionar Nova Loja</h3>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveStore()" #modalForm="ngForm">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nome da Loja / Estabelecimento *</label>
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
                <label class="form-label">Categoria do Estabelecimento</label>
                <input
                  type="text"
                  name="categoria"
                  [(ngModel)]="newStore.categoria"
                  list="categorySuggestions"
                  class="form-control"
                  placeholder="ex: Supermercado, E-commerce, Farmácia, Eletrônicos..."
                />
                <datalist id="categorySuggestions">
                  <option *ngFor="let sc of registeredCategories" [value]="sc.nome">
                  <option value="E-commerce">
                  <option value="Supermercado">
                  <option value="Farmácia">
                  <option value="Eletrônicos & Informática">
                  <option value="Restaurante & Alimentação">
                  <option value="Vestuário & Calçados">
                  <option value="Casa & Decoração">
                  <option value="Serviços">
                  <option value="Outros">
                </datalist>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button
                type="submit"
                [disabled]="!modalForm.valid || saving"
                class="btn btn-primary"
              >
                {{ saving ? 'Salvando...' : 'Cadastrar Loja' }}
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
  `],
})
export class StoresComponent implements OnInit {
  stores: Store[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading: boolean = true;
  showModal: boolean = false;
  saving: boolean = false;

  newStore: CreateStoreDto = {
    nome: '',
    categoria: '',
  };

  registeredCategories: CategoriaLoja[] = [];

  constructor(
    private readonly storesService: StoresService,
    private readonly categoriesService: CategoriesService,
  ) {}

  ngOnInit() {
    this.loadStores();
    this.loadCategories();
    this.loadRegisteredCategories();
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
    this.newStore = {
      nome: '',
      categoria: '',
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveStore() {
    if (!this.newStore.nome.trim()) return;

    this.saving = true;
    this.storesService.create(this.newStore).subscribe({
      next: () => {
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
