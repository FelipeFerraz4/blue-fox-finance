import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExpensesService } from '../../services/expenses.service';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { StoresService } from '../../services/stores.service';
import { BuyersService } from '../../services/buyers.service';
import { LancamentoGrouped, Lancamento } from '../../models/lancamento.model';
import { PaymentMethod } from '../../models/payment-method.model';
import { Store } from '../../models/store.model';
import { Buyer } from '../../models/buyer.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmModalComponent],
  template: `
    <div class="expense-list-page">
      <!-- Header da Página -->
      <div class="page-header">
        <div class="page-header-content">
          <div class="header-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <div class="title-with-pill">
              <h1 class="page-title">Lançamentos de Despesas</h1>
              <span class="badge badge-brand">Histórico & Faturas</span>
            </div>
            <p class="page-subtitle">Visualização de lançamentos com ordenação por mais recente, paginação e filtros</p>
          </div>
        </div>

        <div class="header-actions">
          <!-- Alternador de Visualização -->
          <div class="view-mode-toggle">
            <button
              class="toggle-btn"
              [class.active]="viewMode === 'table'"
              (click)="setViewMode('table')"
              title="Visualizar em Tabela Paginada"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              Tabela (20/pág)
            </button>
            <button
              class="toggle-btn"
              [class.active]="viewMode === 'grouped'"
              (click)="setViewMode('grouped')"
              title="Visualizar Agrupado por Dia e Loja"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Agrupado Dia/Loja
            </button>
          </div>

          <a routerLink="/lancamentos/novo" class="btn btn-primary btn-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Lançamento
          </a>
        </div>
      </div>

      <!-- Barra de Filtros Completa -->
      <div class="card filter-card">
        <!-- Topo: Busca Textual Ampla e Proeminente -->
        <div class="filter-search-header">
          <div class="search-input-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (keyup.enter)="onFilterChange()"
              placeholder="Buscar lançamento por item, comprador, loja, categoria ou observações..."
              class="form-control search-input"
            />
            <button *ngIf="searchTerm" (click)="searchTerm = ''; onFilterChange()" class="btn-clear-search" title="Limpar busca">
              ✕
            </button>
          </div>
          <button (click)="onFilterChange()" class="btn btn-primary btn-pill btn-search-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Buscar</span>
          </button>
        </div>

        <div class="filter-divider"></div>

        <!-- Linha Inferior: Dropdowns e Seletores de Filtro -->
        <div class="filter-grid">
          <!-- Filtro: Categoria da Loja -->
          <div class="filter-item">
            <label class="filter-label">Categoria da Loja:</label>
            <select
              [(ngModel)]="selectedCategoriaLoja"
              (change)="onFilterChange()"
              class="form-control form-control-sm"
            >
              <option value="">Todas as Categorias</option>
              <option *ngFor="let cat of storeCategories" [value]="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <!-- Filtro: Loja -->
          <div class="filter-item">
            <label class="filter-label">Loja / Estabelecimento:</label>
            <select
              [(ngModel)]="selectedLojaId"
              (change)="onFilterChange()"
              class="form-control form-control-sm"
            >
              <option value="">Todas as Lojas</option>
              <option *ngFor="let store of storesList" [value]="store.id">
                {{ store.nome }} {{ store.categoria ? '(' + store.categoria + ')' : '' }}
              </option>
            </select>
          </div>

          <!-- Filtro: Comprador -->
          <div class="filter-item">
            <label class="filter-label">Comprador:</label>
            <select
              [(ngModel)]="selectedCompradorId"
              (change)="onFilterChange()"
              class="form-control form-control-sm"
            >
              <option value="">Todos os Compradores</option>
              <option *ngFor="let b of buyersList" [value]="b.id">
                {{ b.nome }}
              </option>
            </select>
          </div>

          <!-- Filtro: Meio de Pagamento -->
          <div class="filter-item">
            <label class="filter-label">Meio de Pagamento:</label>
            <select
              [(ngModel)]="selectedMeioPagamentoId"
              (change)="onFilterChange()"
              class="form-control form-control-sm"
            >
              <option value="">Todos os Meios</option>
              <option *ngFor="let m of paymentMethodsList" [value]="m.id">
                {{ m.nome }} ({{ m.instituicaoBanco }})
              </option>
            </select>
          </div>

          <!-- Filtro: Mês / Competência -->
          <div class="filter-item">
            <label class="filter-label">Mês de Referência:</label>
            <input
              type="month"
              [(ngModel)]="selectedMonth"
              (change)="onFilterChange()"
              class="form-control form-control-sm"
            />
          </div>
        </div>

        <div class="filter-footer" *ngIf="hasActiveFilters">
          <button (click)="clearFilters()" class="btn-clear-filters">
            ✕ Limpar Todos os Filtros
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card loading-state">
        <div class="spinner"></div>
        <p>Carregando lançamentos...</p>
      </div>

      <!-- VISUALIZAÇÃO 1: TABELA PAGINADA (PADRÃO - 20 ITENS POR PÁGINA) -->
      <div *ngIf="!loading && viewMode === 'table'">
        <!-- Barra de resumo do total -->
        <div class="table-summary-bar">
          <span class="text-sm text-muted">
            Total de registros: <strong>{{ totalExpenses }}</strong> lançamentos encontrados
          </span>
          <span class="text-sm text-muted" *ngIf="totalPages > 1">
            Página <strong>{{ currentPage }}</strong> de <strong>{{ totalPages }}</strong>
          </span>
        </div>

        <div *ngIf="expenses.length > 0; else noExpenses" class="card table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Loja / Estabelecimento</th>
                  <th>Item / Nome</th>
                  <th>Comprador</th>
                  <th>Categoria</th>
                  <th class="text-center">Qtd</th>
                  <th class="text-right">Valor Unit.</th>
                  <th class="text-right">Valor Total</th>
                  <th>Meio de Pagamento</th>
                  <th>Tipo / Parcelas</th>
                  <th class="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of expenses">
                  <td>
                    <span class="date-badge">
                      {{ item.data | date:'dd/MM/yyyy' }}
                    </span>
                  </td>
                  <td>
                    <strong class="text-gray-900 font-medium">{{ item.loja }}</strong>
                  </td>
                  <td>
                    <div class="font-medium text-gray-900">{{ item.nome }}</div>
                    <small class="text-muted" *ngIf="item.observacoes">{{ item.observacoes }}</small>
                  </td>
                  <td>
                    <span class="comprador-badge">{{ item.comprador }}</span>
                  </td>
                  <td>
                    <span class="badge badge-gray">{{ item.categoria }}</span>
                  </td>
                  <td class="text-center font-medium">{{ formatQuantity(item.quantidade) }}</td>
                  <td class="text-right text-muted">
                    {{ item.valorUnitario | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </td>
                  <td class="text-right font-bold text-primary">
                    {{ item.valorTotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </td>
                  <td>
                    <span class="badge badge-primary">
                      {{ item.meioPagamento?.nome || 'N/A' }}
                    </span>
                  </td>
                  <td>
                    <button
                      *ngIf="item.tipo === 'PARCELADO'"
                      (click)="openParcelasModal(item)"
                      class="btn-parcelas-pill"
                      title="Ver parcelas do lançamento"
                    >
                      <span class="pill-badge">{{ item.numeroParcelas }}x</span>
                      <span class="pill-text">ver parcelas</span>
                    </button>
                    <span
                      *ngIf="item.tipo !== 'PARCELADO'"
                      class="badge badge-success"
                    >
                      À Vista
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="table-actions-row">
                      <button
                        (click)="openEditModal(item)"
                        class="btn-action-icon btn-action-edit"
                        title="Editar Lançamento"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span class="action-btn-text">Editar</span>
                      </button>
                      <button
                        (click)="promptDelete(item)"
                        class="btn-action-icon btn-action-delete"
                        title="Excluir Lançamento"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        <span class="action-btn-text">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Controles de Paginação -->
          <div class="pagination-footer">
            <div class="pagination-info">
              Exibindo <strong>{{ totalExpenses > 0 ? (currentPage - 1) * pageSize + 1 : 0 }}</strong> a
              <strong>{{ getPaginationEnd() }}</strong> de <strong>{{ totalExpenses }}</strong> lançamentos
            </div>

            <div class="pagination-buttons">
              <button
                class="btn btn-secondary btn-sm"
                [disabled]="currentPage <= 1"
                (click)="goToPage(currentPage - 1)"
              >
                ← Anterior
              </button>

              <div class="pagination-pages">
                <span class="page-number-current">{{ currentPage }}</span>
                <span class="page-number-total">de {{ totalPages }}</span>
              </div>

              <button
                class="btn btn-secondary btn-sm"
                [disabled]="currentPage >= totalPages"
                (click)="goToPage(currentPage + 1)"
              >
                Próxima →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- VISUALIZAÇÃO 2: AGRUPADO POR DIA E LOJA -->
      <div *ngIf="!loading && viewMode === 'grouped'">
        <div *ngIf="filteredGroups.length > 0; else noExpenses" class="groups-container">
          <div *ngFor="let group of filteredGroups; let idx = index" class="card group-card">
            <!-- Cabeçalho do Grupo -->
            <div class="group-header" (click)="toggleGroup(idx)">
              <div class="group-info-left">
                <div class="calendar-pill">
                  <span class="cal-day">{{ getDayNumber(group.data) }}</span>
                  <span class="cal-month">{{ getMonthAbbr(group.data) }}</span>
                </div>
                <div class="group-titles">
                  <h3 class="store-name">{{ group.loja }}</h3>
                  <span class="group-date-text">Data: {{ group.dataFormatada }}</span>
                </div>
              </div>

              <div class="group-info-right">
                <div class="group-stat">
                  <span class="stat-label">Itens</span>
                  <span class="stat-badge">{{ formatQuantity(group.totalItens) }}</span>
                </div>
                <div class="group-stat">
                  <span class="stat-label">Total do Grupo</span>
                  <span class="stat-val font-bold">
                    {{ group.totalValor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                </div>
                <div class="chevron-icon" [class.rotated]="isGroupExpanded(idx)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Detalhes dos Itens do Grupo -->
            <div *ngIf="isGroupExpanded(idx)" class="group-details-body">
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Item / Nome</th>
                      <th>Comprador</th>
                      <th>Categoria</th>
                      <th class="text-center">Qtd</th>
                      <th class="text-right">Valor Unit.</th>
                      <th class="text-right">Valor Total</th>
                      <th>Meio Pagamento</th>
                      <th>Tipo / Parcelas</th>
                      <th class="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of group.itens">
                      <td>
                        <div class="font-medium text-gray-900">{{ item.nome }}</div>
                        <small class="text-muted" *ngIf="item.observacoes">{{ item.observacoes }}</small>
                      </td>
                      <td>
                        <span class="comprador-badge">{{ item.comprador }}</span>
                      </td>
                      <td>
                        <span class="badge badge-gray">{{ item.categoria }}</span>
                      </td>
                      <td class="text-center font-medium">{{ formatQuantity(item.quantidade) }}</td>
                      <td class="text-right text-muted">
                        {{ item.valorUnitario | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </td>
                      <td class="text-right font-bold text-primary">
                        {{ item.valorTotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </td>
                      <td>
                        <span class="badge badge-primary">{{ item.meioPagamento?.nome || 'N/A' }}</span>
                      </td>
                      <td>
                        <button
                          *ngIf="item.tipo === 'PARCELADO'"
                          (click)="openParcelasModal(item)"
                          class="btn-parcelas-pill"
                          title="Ver parcelas do lançamento"
                        >
                          <span class="pill-badge">{{ item.numeroParcelas }}x</span>
                          <span class="pill-text">ver parcelas</span>
                        </button>
                        <span
                          *ngIf="item.tipo !== 'PARCELADO'"
                          class="badge badge-success"
                        >
                          À Vista
                        </span>
                      </td>
                      <td class="text-center">
                        <div class="table-actions-row">
                          <button
                            (click)="openEditModal(item)"
                            class="btn-action-icon btn-action-edit"
                            title="Editar Lançamento"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <span class="action-btn-text">Editar</span>
                          </button>
                          <button
                            (click)="promptDelete(item)"
                            class="btn-action-icon btn-action-delete"
                            title="Excluir Lançamento"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            <span class="action-btn-text">Excluir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nenhum Lançamento Encontrado -->
      <ng-template #noExpenses>
        <div class="card empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3 class="mt-3">Nenhum lançamento encontrado</h3>
          <p class="text-muted">Não foram encontrados registros para os filtros selecionados.</p>
          <div class="empty-state-actions mt-3">
            <button *ngIf="hasActiveFilters" (click)="clearFilters()" class="btn btn-secondary btn-sm">
              Limpar Filtros
            </button>
            <a routerLink="/lancamentos/novo" class="btn btn-primary btn-sm">
              + Adicionar Novo Lançamento
            </a>
          </div>
        </div>
      </ng-template>

      <!-- Modal de Detalhes das Parcelas do Lançamento -->
      <div *ngIf="selectedItemForModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Parcelas do Lançamento: {{ selectedItemForModal.nome }}</h3>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-summary-box mb-3">
              <div>
                <span class="text-muted text-xs">Loja:</span>
                <strong>{{ selectedItemForModal.loja }}</strong>
              </div>
              <div>
                <span class="text-muted text-xs">Meio de Pagamento:</span>
                <strong>{{ selectedItemForModal.meioPagamento?.nome }}</strong>
              </div>
              <div>
                <span class="text-muted text-xs">Valor Total:</span>
                <strong class="text-primary">
                  {{ selectedItemForModal.valorTotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </strong>
                ({{ selectedItemForModal.numeroParcelas }}x)
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th>Parcela</th>
                  <th>Mês de Referência</th>
                  <th>Vencimento Estimado</th>
                  <th class="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of selectedItemForModal.parcelas">
                  <td><strong>{{ p.numero }} / {{ p.totalParcelas }}</strong></td>
                  <td>{{ p.mesReferencia }}</td>
                  <td>{{ p.dataVencimento | date:'dd/MM/yyyy' }}</td>
                  <td class="text-right font-bold text-primary">
                    {{ p.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer mt-4 text-right">
            <button class="btn btn-secondary" (click)="closeModal()">Fechar</button>
          </div>
        </div>
      </div>

      <!-- Modal de Edição de Lançamento -->
      <div *ngIf="editModalOpen" class="modal-backdrop" (click)="closeEditModal()">
        <div class="modal-content modal-content-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-with-icon">
              <div class="icon-circle icon-circle-edit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h3>Editar Lançamento</h3>
                <p class="modal-subtitle">Atualize as informações do lançamento de despesa</p>
              </div>
            </div>
            <button class="btn-close" (click)="closeEditModal()">✕</button>
          </div>

          <form (ngSubmit)="saveEdit()" class="modal-form-body">
            <!-- Alerta de Erro de Validação/Servidor -->
            <div *ngIf="editError" class="alert-box alert-error mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ editError }}</span>
            </div>

            <div class="form-grid-2col">
              <!-- Comprador -->
              <div class="form-group">
                <label class="form-label">Comprador *</label>
                <select
                  [(ngModel)]="editSelectedBuyerId"
                  (change)="onEditBuyerChange()"
                  name="editCompradorSelect"
                  class="form-control"
                >
                  <option value="" disabled>Selecione um comprador...</option>
                  <option *ngFor="let b of buyersList" [value]="b.id">
                    {{ b.nome }}
                  </option>
                  <option value="OUTRO">Outro comprador (digitar manualmente)...</option>
                </select>

                <input
                  *ngIf="editSelectedBuyerId === 'OUTRO'"
                  type="text"
                  [(ngModel)]="editForm.comprador"
                  name="editCompradorManual"
                  placeholder="Digite o nome do comprador..."
                  class="form-control mt-2"
                />
              </div>

              <!-- Loja -->
              <div class="form-group">
                <label class="form-label">Loja / Estabelecimento *</label>
                <select
                  [(ngModel)]="editSelectedStoreId"
                  (change)="onEditStoreChange()"
                  name="editLojaSelect"
                  class="form-control"
                >
                  <option value="" disabled>Selecione uma loja...</option>
                  <option *ngFor="let s of storesList" [value]="s.id">
                    {{ s.nome }} {{ s.categoria ? '(' + s.categoria + ')' : '' }}
                  </option>
                  <option value="OUTRA">Outra loja (digitar manualmente)...</option>
                </select>

                <input
                  *ngIf="editSelectedStoreId === 'OUTRA'"
                  type="text"
                  [(ngModel)]="editForm.loja"
                  name="editLojaManual"
                  placeholder="Digite o nome da loja..."
                  class="form-control mt-2"
                />
              </div>

              <!-- Item / Nome -->
              <div class="form-group">
                <label class="form-label">Nome / Descrição do Item *</label>
                <input
                  type="text"
                  [(ngModel)]="editForm.nome"
                  name="editNome"
                  required
                  class="form-control"
                  placeholder="Descrição do item"
                />
              </div>

              <!-- Categoria -->
              <div class="form-group">
                <label class="form-label">Categoria *</label>
                <input
                  type="text"
                  [(ngModel)]="editForm.categoria"
                  name="editCategoria"
                  list="editCategoriasList"
                  required
                  class="form-control"
                  placeholder="Categoria do item"
                />
                <datalist id="editCategoriasList">
                  <option value="Alimentação">
                  <option value="Supermercado">
                  <option value="Moradia">
                  <option value="Transporte">
                  <option value="Tecnologia">
                  <option value="Saúde">
                  <option value="Lazer">
                  <option value="Educação">
                  <option value="Vestuário">
                  <option value="Outros">
                </datalist>
              </div>

              <!-- Data da Compra -->
              <div class="form-group">
                <label class="form-label">Data da Compra *</label>
                <input
                  type="date"
                  [(ngModel)]="editForm.data"
                  name="editData"
                  required
                  class="form-control"
                />
              </div>

              <!-- Meio de Pagamento -->
              <div class="form-group">
                <label class="form-label">Meio de Pagamento *</label>
                <select
                  [(ngModel)]="editForm.meioPagamentoId"
                  name="editMeioPagamento"
                  required
                  class="form-control"
                >
                  <option value="" disabled>Selecione um meio de pagamento...</option>
                  <option *ngFor="let m of paymentMethodsList" [value]="m.id">
                    {{ m.nome }} ({{ m.instituicaoBanco }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Linha Financeira: Qtd, Valor Unitário, Valor Total -->
            <div class="form-grid-3col mt-2">
              <div class="form-group">
                <label class="form-label">Quantidade *</label>
                <input
                  type="text"
                  inputmode="decimal"
                  [(ngModel)]="editForm.quantidade"
                  (input)="recalculateEditTotal()"
                  name="editQtd"
                  class="form-control text-center font-bold"
                  placeholder="Ex: 1 ou 0,350"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Valor Unitário (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="editForm.valorUnitario"
                  (input)="recalculateEditTotal()"
                  name="editValorUnit"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Valor Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  [(ngModel)]="editForm.valorTotal"
                  name="editValorTotal"
                  class="form-control font-bold text-primary"
                />
              </div>
            </div>

            <!-- Tipo e Parcelas -->
            <div class="form-grid-2col mt-2">
              <div class="form-group">
                <label class="form-label">Tipo de Pagamento *</label>
                <select
                  [(ngModel)]="editForm.tipo"
                  name="editTipo"
                  class="form-control"
                >
                  <option value="A_VISTA">À Vista</option>
                  <option value="PARCELADO">Parcelado</option>
                </select>
              </div>

              <div class="form-group" *ngIf="editForm.tipo === 'PARCELADO'">
                <label class="form-label">Número de Parcelas *</label>
                <select
                  [(ngModel)]="editForm.numeroParcelas"
                  name="editNumParcelas"
                  class="form-control"
                >
                  <option *ngFor="let n of parcelasOptions" [value]="n">
                    {{ n }}x de {{ (editForm.valorTotal / n) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Observações -->
            <div class="form-group mt-2">
              <label class="form-label">Observações (opcional)</label>
              <textarea
                [(ngModel)]="editForm.observacoes"
                name="editObservacoes"
                rows="2"
                class="form-control"
                placeholder="Detalhes ou notas adicionais..."
              ></textarea>
            </div>

            <div class="modal-footer mt-4">
              <button
                type="button"
                class="btn btn-secondary"
                [disabled]="savingEdit"
                (click)="closeEditModal()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="savingEdit"
              >
                <span *ngIf="!savingEdit">Salvar Alterações</span>
                <span *ngIf="savingEdit" class="btn-spinner-wrap">
                  <span class="mini-spinner"></span>
                  Salvando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação Reutilizável para Exclusão -->
      <app-confirm-modal
        [isOpen]="showDeleteModal"
        [title]="'Excluir Lançamento'"
        [message]="'Tem certeza que deseja excluir permanentemente este lançamento? Todas as parcelas associadas serão removidas.'"
        [itemName]="expenseToDelete ? (expenseToDelete.nome + ' (' + (expenseToDelete.valorTotal | currency:'BRL':'symbol':'1.2-2':'pt-BR') + ')') : ''"
        [confirmText]="'Sim, Excluir'"
        [cancelText]="'Cancelar'"
        [variant]="'danger'"
        [loading]="deletingExpense"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .expense-list-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .view-mode-toggle {
      display: flex;
      background: #f1f5f9;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      padding: 2px;
      gap: 2px;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: transparent;
      border: none;
      padding: 0.4rem 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--gray-600);
      border-radius: calc(var(--radius-md) - 2px);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .toggle-btn.active {
      background: white;
      color: var(--primary);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filter-card {
      padding: 1.25rem;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .filter-search-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .search-input-box {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      pointer-events: none;
    }

    .search-input {
      padding-left: 2.35rem;
      padding-right: 2.2rem;
      font-size: 0.92rem;
      height: 42px;
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

    .btn-search-action {
      height: 42px;
      padding: 0 1.35rem;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .filter-divider {
      height: 1px;
      background: var(--gray-200);
      margin: 1rem 0;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      align-items: flex-end;
    }

    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--gray-600);
    }

    .filter-footer {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn-clear-filters {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #ef4444;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
    }

    .btn-clear-filters:hover {
      background: #fee2e2;
      border-color: #ef4444;
    }

    @media (max-width: 640px) {
      .filter-search-header {
        flex-direction: column;
        align-items: stretch;
      }
      .btn-search-action {
        width: 100%;
      }
      .filter-grid {
        grid-template-columns: 1fr;
      }
    }

    .table-summary-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0.25rem;
    }

    .table-card {
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--gray-200);
    }

    .store-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .badge-light-blue {
      background: #e0f2fe;
      color: #0369a1;
      width: fit-content;
    }

    .date-badge {
      font-weight: 600;
      color: var(--gray-700);
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .comprador-badge {
      font-weight: 600;
      color: var(--gray-800);
    }

    /* Botão Parcelas Pílula */
    .btn-parcelas-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      padding: 0.25rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .btn-parcelas-pill:hover {
      background: #dbeafe;
      border-color: #93c5fd;
      color: #1e40af;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.12);
    }

    .btn-parcelas-pill .pill-badge {
      background: #2563eb;
      color: white;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.05rem 0.4rem;
      border-radius: 9999px;
    }

    .btn-parcelas-pill .pill-text {
      font-size: 0.76rem;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    /* Linha de Ações da Tabela */
    .table-actions-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }

    .btn-action-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 1px solid transparent;
      cursor: pointer;
      padding: 0.32rem 0.55rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.15s ease;
    }

    .btn-action-edit {
      background: #f1f5f9;
      border-color: var(--gray-300);
      color: var(--gray-700);
    }

    .btn-action-edit:hover {
      background: #e2e8f0;
      color: var(--gray-900);
      border-color: var(--gray-400);
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
    }

    .action-btn-text {
      display: inline;
    }

    /* Estilos do Modal de Edição */
    .modal-content-lg {
      max-width: 640px !important;
      width: 100%;
    }

    .modal-title-with-icon {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-title-with-icon h3 {
      margin: 0;
      font-size: 1.15rem;
      color: var(--gray-900);
    }

    .modal-subtitle {
      margin: 0;
      font-size: 0.8rem;
      color: var(--gray-500);
    }

    .icon-circle-edit {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-form-body {
      padding: 0.5rem 0;
    }

    .form-grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .form-grid-3col {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.85rem;
    }

    @media (max-width: 640px) {
      .form-grid-2col,
      .form-grid-3col {
        grid-template-columns: 1fr;
      }
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid var(--gray-200);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      font-size: 0.85rem;
      color: var(--gray-600);
    }

    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .pagination-pages {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
    }

    .page-number-current {
      background: var(--primary);
      color: white;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
    }

    .page-number-total {
      color: var(--gray-500);
    }

    /* Estilos do Modo Agrupado */
    .groups-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .group-card {
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--gray-200);
    }

    .group-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      background: #ffffff;
      transition: background 0.15s ease;
      user-select: none;
    }

    .group-header:hover {
      background: #f8fafc;
    }

    .group-info-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .calendar-pill {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 50px;
    }

    .cal-day {
      font-size: 1.15rem;
      font-weight: 800;
      line-height: 1;
    }

    .cal-month {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .store-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .group-date-text {
      font-size: 0.8rem;
      color: var(--gray-500);
    }

    .group-info-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .group-stat {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      text-transform: uppercase;
      font-weight: 600;
    }

    .stat-badge {
      background: var(--gray-100);
      color: var(--gray-700);
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    .stat-val {
      font-size: 1.15rem;
      color: #2563eb;
    }

    .chevron-icon {
      color: var(--gray-400);
      transition: transform 0.2s ease;
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    .group-details-body {
      border-top: 1px solid var(--gray-200);
      background: #fafafa;
    }

    .modal-summary-box {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .empty-state-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }

    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-muted { color: var(--gray-500); }
    .text-xs { font-size: 0.75rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--gray-200);
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--gray-400);
    }
  `],
})
export class ExpenseListComponent implements OnInit {
  viewMode: 'table' | 'grouped' = 'table'; // Padrão: Tabela paginada (20 itens)

  // Filtros
  selectedCategoriaLoja: string = '';
  selectedLojaId: string = '';
  selectedCompradorId: string = '';
  selectedMeioPagamentoId: string = '';
  selectedMonth: string = '';
  searchTerm: string = '';

  // Opções para os filtros
  storeCategories: string[] = [];
  storesList: Store[] = [];
  buyersList: Buyer[] = [];
  paymentMethodsList: PaymentMethod[] = [];

  // Dados da visualização em tabela (paginada)
  expenses: Lancamento[] = [];
  totalExpenses: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;
  pageSize: number = 20;

  // Dados da visualização agrupada
  groups: LancamentoGrouped[] = [];
  expandedGroups: Set<number> = new Set([0]);

  loading: boolean = true;
  selectedItemForModal: Lancamento | null = null;

  // Estado do Modal de Edição
  editModalOpen: boolean = false;
  editingItem: Lancamento | null = null;
  editSelectedStoreId: string = '';
  editSelectedBuyerId: string = '';
  editForm: {
    comprador: string;
    compradorId?: string;
    loja: string;
    lojaId?: string;
    nome: string;
    categoria: string;
    data: string;
    quantidade: number | string;
    valorUnitario: number;
    valorTotal: number;
    meioPagamentoId: string;
    tipo: 'A_VISTA' | 'PARCELADO';
    numeroParcelas: number;
    observacoes: string;
  } = {
    comprador: '',
    loja: '',
    nome: '',
    categoria: '',
    data: '',
    quantidade: 1,
    valorUnitario: 0,
    valorTotal: 0,
    meioPagamentoId: '',
    tipo: 'A_VISTA',
    numeroParcelas: 1,
    observacoes: '',
  };
  parcelasOptions: number[] = Array.from({ length: 48 }, (_, i) => i + 1);
  savingEdit: boolean = false;
  editError: string = '';

  // Estado do Modal de Confirmação de Exclusão
  showDeleteModal: boolean = false;
  expenseToDelete: Lancamento | null = null;
  deletingExpense: boolean = false;

  constructor(
    private readonly expensesService: ExpensesService,
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly storesService: StoresService,
    private readonly buyersService: BuyersService,
  ) {}

  ngOnInit() {
    this.loadFilterOptions();
    this.loadExpenses();
  }

  loadFilterOptions() {
    this.storesService.getCategories().subscribe({
      next: (cats) => (this.storeCategories = cats),
      error: (err) => console.error('Erro ao carregar categorias de loja:', err),
    });

    this.storesService.getAll().subscribe({
      next: (stores) => (this.storesList = stores),
      error: (err) => console.error('Erro ao carregar lojas:', err),
    });

    this.buyersService.getAll().subscribe({
      next: (buyers) => (this.buyersList = buyers),
      error: (err) => console.error('Erro ao carregar compradores:', err),
    });

    this.paymentMethodsService.getAll(false).subscribe({
      next: (methods) => (this.paymentMethodsList = methods),
      error: (err) => console.error('Erro ao carregar meios de pagamento:', err),
    });
  }

  loadExpenses() {
    this.loading = true;
    this.expensesService
      .getAll({
        page: this.currentPage,
        limit: this.pageSize,
        categoriaLoja: this.selectedCategoriaLoja || undefined,
        lojaId: this.selectedLojaId || undefined,
        compradorId: this.selectedCompradorId || undefined,
        meioPagamentoId: this.selectedMeioPagamentoId || undefined,
        mesReferencia: this.selectedMonth || undefined,
        search: this.searchTerm || undefined,
      })
      .subscribe({
        next: (result) => {
          this.expenses = result.data;
          this.totalExpenses = result.total;
          this.totalPages = result.totalPages;
          this.currentPage = result.page;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar despesas paginadas:', err);
          this.loading = false;
        },
      });
  }

  loadGroupedExpenses() {
    this.loading = true;
    this.expensesService.getGrouped(this.selectedMonth).subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
        if (this.groups.length > 0) {
          this.expandedGroups = new Set([0]);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar despesas agrupadas:', err);
        this.loading = false;
      },
    });
  }

  setViewMode(mode: 'table' | 'grouped') {
    this.viewMode = mode;
    if (mode === 'table') {
      this.loadExpenses();
    } else {
      this.loadGroupedExpenses();
    }
  }

  onFilterChange() {
    this.currentPage = 1;
    if (this.viewMode === 'table') {
      this.loadExpenses();
    } else {
      this.loadGroupedExpenses();
    }
  }

  clearFilters() {
    this.selectedCategoriaLoja = '';
    this.selectedLojaId = '';
    this.selectedCompradorId = '';
    this.selectedMeioPagamentoId = '';
    this.selectedMonth = '';
    this.searchTerm = '';
    this.currentPage = 1;
    if (this.viewMode === 'table') {
      this.loadExpenses();
    } else {
      this.loadGroupedExpenses();
    }
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.selectedCategoriaLoja ||
      this.selectedLojaId ||
      this.selectedCompradorId ||
      this.selectedMeioPagamentoId ||
      this.selectedMonth ||
      this.searchTerm
    );
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadExpenses();
    }
  }

  getPaginationEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalExpenses);
  }

  // Métodos do Modo Agrupado
  get filteredGroups(): LancamentoGrouped[] {
    if (!this.searchTerm.trim() && !this.selectedCategoriaLoja && !this.selectedLojaId && !this.selectedCompradorId && !this.selectedMeioPagamentoId) {
      return this.groups;
    }
    const term = this.searchTerm.toLowerCase();
    return this.groups
      .map((g) => {
        const matchingItens = g.itens.filter((item) => {
          const matchTerm =
            !term ||
            item.nome.toLowerCase().includes(term) ||
            item.loja.toLowerCase().includes(term) ||
            item.comprador.toLowerCase().includes(term) ||
            item.categoria.toLowerCase().includes(term);

          const matchStore = !this.selectedLojaId || item.lojaId === this.selectedLojaId;
          const matchBuyer = !this.selectedCompradorId || item.compradorId === this.selectedCompradorId || item.comprador.toLowerCase() === (this.buyersList.find(b => b.id === this.selectedCompradorId)?.nome.toLowerCase() || '');
          const matchPayment = !this.selectedMeioPagamentoId || item.meioPagamentoId === this.selectedMeioPagamentoId;
          const matchCatLoja = !this.selectedCategoriaLoja || (item.lojaRel && item.lojaRel.categoria === this.selectedCategoriaLoja);

          return matchTerm && matchStore && matchBuyer && matchPayment && matchCatLoja;
        });

        if (matchingItens.length > 0) {
          return {
            ...g,
            itens: matchingItens,
            totalItens: matchingItens.length,
            totalValor: matchingItens.reduce((acc, i) => acc + i.valorTotal, 0),
          };
        }
        return null;
      })
      .filter((g): g is LancamentoGrouped => g !== null);
  }

  toggleGroup(index: number) {
    if (this.expandedGroups.has(index)) {
      this.expandedGroups.delete(index);
    } else {
      this.expandedGroups.add(index);
    }
  }

  isGroupExpanded(index: number): boolean {
    return this.expandedGroups.has(index);
  }

  getDayNumber(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.split('-')[2] || '';
  }

  getMonthAbbr(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }

  openParcelasModal(item: Lancamento) {
    this.selectedItemForModal = item;
  }

  closeModal() {
    this.selectedItemForModal = null;
  }

  // Métodos do Modal de Confirmação de Exclusão Reutilizável
  promptDelete(item: Lancamento) {
    this.expenseToDelete = item;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.expenseToDelete = null;
  }

  confirmDelete() {
    if (!this.expenseToDelete) return;
    this.deletingExpense = true;
    this.expensesService.delete(this.expenseToDelete.id).subscribe({
      next: () => {
        this.deletingExpense = false;
        this.showDeleteModal = false;
        this.expenseToDelete = null;
        if (this.viewMode === 'table') {
          this.loadExpenses();
        } else {
          this.loadGroupedExpenses();
        }
      },
      error: (err) => {
        this.deletingExpense = false;
        alert('Erro ao excluir lançamento: ' + (err.error?.message || err.message));
      },
    });
  }

  // Métodos do Modal de Edição de Lançamento
  openEditModal(item: Lancamento) {
    this.editingItem = item;
    this.editError = '';

    const matchedStore = this.storesList.find(
      (s) => s.id === item.lojaId || s.nome.toLowerCase() === item.loja.toLowerCase(),
    );
    if (matchedStore) {
      this.editSelectedStoreId = matchedStore.id;
    } else {
      this.editSelectedStoreId = 'OUTRA';
    }

    const matchedBuyer = this.buyersList.find(
      (b) => b.id === item.compradorId || b.nome.toLowerCase() === item.comprador.toLowerCase(),
    );
    if (matchedBuyer) {
      this.editSelectedBuyerId = matchedBuyer.id;
    } else {
      this.editSelectedBuyerId = 'OUTRO';
    }

    this.editForm = {
      comprador: item.comprador,
      compradorId: item.compradorId || undefined,
      loja: item.loja,
      lojaId: item.lojaId || undefined,
      nome: item.nome,
      categoria: item.categoria,
      data: item.data ? item.data.substring(0, 10) : '',
      quantidade: item.quantidade || 1,
      valorUnitario: item.valorUnitario || 0,
      valorTotal: item.valorTotal || 0,
      meioPagamentoId: item.meioPagamentoId || '',
      tipo: item.tipo || 'A_VISTA',
      numeroParcelas: item.numeroParcelas || 1,
      observacoes: item.observacoes || '',
    };
    this.editModalOpen = true;
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.editingItem = null;
    this.editError = '';
  }

  onEditBuyerChange() {
    if (this.editSelectedBuyerId === 'OUTRO') {
      this.editForm.compradorId = undefined;
    } else {
      const buyer = this.buyersList.find((b) => b.id === this.editSelectedBuyerId);
      if (buyer) {
        this.editForm.compradorId = buyer.id;
        this.editForm.comprador = buyer.nome;
      }
    }
  }

  onEditStoreChange() {
    if (this.editSelectedStoreId === 'OUTRA') {
      this.editForm.lojaId = undefined;
    } else {
      const store = this.storesList.find((s) => s.id === this.editSelectedStoreId);
      if (store) {
        this.editForm.lojaId = store.id;
        this.editForm.loja = store.nome;
      }
    }
  }

  parseQuantity(val: any): number {
    if (typeof val === 'number') {
      return isNaN(val) || val <= 0 ? 0 : val;
    }
    if (!val) return 0;
    const str = String(val).trim();
    if (str.includes(',')) {
      const normalized = str.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(normalized);
      return isNaN(num) || num <= 0 ? 0 : Number(num.toFixed(3));
    }
    const num = parseFloat(str);
    return isNaN(num) || num <= 0 ? 0 : Number(num.toFixed(3));
  }

  formatQuantity(val: any): string {
    if (val === undefined || val === null || val === '') return '0';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  }

  recalculateEditTotal() {
    const qty = this.parseQuantity(this.editForm.quantidade);
    const unit = Number(this.editForm.valorUnitario) || 0;
    if (qty > 0 && unit > 0) {
      this.editForm.valorTotal = parseFloat((qty * unit).toFixed(2));
    }
  }

  saveEdit() {
    if (!this.editingItem) return;

    if (!this.editForm.comprador?.trim()) {
      this.editError = 'O comprador é obrigatório.';
      return;
    }
    if (!this.editForm.loja?.trim()) {
      this.editError = 'A loja / estabelecimento é obrigatório.';
      return;
    }
    if (!this.editForm.nome?.trim()) {
      this.editError = 'O nome / descrição do item é obrigatório.';
      return;
    }
    if (!this.editForm.categoria?.trim()) {
      this.editError = 'A categoria é obrigatória.';
      return;
    }
    if (!this.editForm.data) {
      this.editError = 'A data é obrigatória.';
      return;
    }
    if (!this.editForm.meioPagamentoId) {
      this.editError = 'Selecione um meio de pagamento.';
      return;
    }
    if (!this.editForm.valorTotal || this.editForm.valorTotal <= 0) {
      this.editError = 'O valor total deve ser maior que zero.';
      return;
    }

    const qty = this.parseQuantity(this.editForm.quantidade);
    if (qty <= 0) {
      this.editError = 'A quantidade deve ser maior que zero.';
      return;
    }

    this.savingEdit = true;
    this.editError = '';

    const payload = {
      ...this.editForm,
      quantidade: qty,
      valorUnitario: Number(this.editForm.valorUnitario) || 0,
      valorTotal: Number(this.editForm.valorTotal) || 0,
      numeroParcelas: this.editForm.tipo === 'PARCELADO' ? Number(this.editForm.numeroParcelas) || 1 : 1,
    };

    this.expensesService.update(this.editingItem.id, payload).subscribe({
      next: () => {
        this.savingEdit = false;
        this.closeEditModal();
        if (this.viewMode === 'table') {
          this.loadExpenses();
        } else {
          this.loadGroupedExpenses();
        }
      },
      error: (err) => {
        this.savingEdit = false;
        this.editError = err.error?.message || err.message || 'Erro ao atualizar lançamento.';
      },
    });
  }
}
