import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethodsService } from '../../../core/services/payment-methods/payment-methods.service';
import { ExpensePreferencesService } from '../../../core/services/expense-preferences/expense-preferences.service';
import { PaymentMethod, CreatePaymentMethodDto, ModalidadePagamento } from '../../../shared/model/types/payment-method.model';
import { ConfirmModalComponent } from '../../../shared/components/general/confirm-modal/confirm-modal.component';
import { SearchableDropdownComponent } from '../../../shared/components/general/searchable-dropdown';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, SearchableDropdownComponent],
  template: `
    <div class="payment-methods-page">
      <div class="page-header">
        <div class="page-header-content">
          <div class="title-with-pill">
            <div class="header-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <h1 class="page-title">Meios de Pagamento</h1>
            <span class="badge badge-brand">Cartões & Contas</span>
          </div>
          <p class="page-subtitle">
            Cadastre seus cartões de crédito com dias de fechamento e vencimento para projeção exata das faturas futuras
          </p>
        </div>

        <button (click)="openAddModal()" class="btn btn-primary btn-pill add-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Adicionar Meio de Pagamento</span>
        </button>
      </div>

      <!-- Tabela Principal de Meios de Pagamento -->
      <div class="card">
        <div class="card-title">
          <span>Meios de Pagamento Cadastrados</span>
          <span class="badge badge-primary">{{ methods.length }} configurados</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Carregando meios de pagamento...</p>
        </div>

        <div *ngIf="!loading && methods.length > 0">
          <div class="desktop-table-container">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Meio de Pagamento</th>
                    <th>Modalidade</th>
                    <th class="text-center">Dia de Fechamento</th>
                    <th class="text-center">Dia de Vencimento</th>
                    <th>Banco</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of methods">
                    <td>
                      <div class="method-name-col">
                        <strong class="text-gray-900">{{ m.nome }}</strong>
                        <span *ngIf="isMethodDefault(m.id)" class="badge-default-pill">★ Padrão</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getModalidadeClass(m.modalidade)">
                        {{ getModalidadeLabel(m.modalidade) }}
                      </span>
                    </td>
                    <td class="text-center font-medium">
                      <span *ngIf="m.diaFechamento" class="day-badge">Dia {{ m.diaFechamento }}</span>
                      <span *ngIf="!m.diaFechamento" class="text-muted">-</span>
                    </td>
                    <td class="text-center font-medium">
                      <span *ngIf="m.diaVencimento" class="day-badge highlight-due">Dia {{ m.diaVencimento }}</span>
                      <span *ngIf="!m.diaVencimento" class="text-muted">-</span>
                    </td>
                    <td>
                      <span class="banco-tag">{{ m.instituicaoBanco }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="m.ativo ? 'badge-success' : 'badge-danger'">
                        {{ m.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <div class="table-actions">
                        <button
                          (click)="openEditModal(m)"
                          class="btn btn-outline btn-sm"
                          title="Editar meio de pagamento"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Editar
                        </button>
                        <button
                          (click)="toggleStatus(m)"
                          class="btn btn-secondary btn-sm"
                          [title]="m.ativo ? 'Desativar meio' : 'Ativar meio'"
                        >
                          {{ m.ativo ? 'Desativar' : 'Ativar' }}
                        </button>
                        <button
                          (click)="promptDeleteMethod(m)"
                          class="btn btn-danger btn-sm"
                          title="Excluir meio de pagamento"
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

          <!-- Cards Mobile de Meios de Pagamento -->
          <div class="mobile-cards-container">
            <div *ngFor="let m of methods" class="method-mobile-card">
              <!-- Topo: Nome do Meio de Pagamento e Status -->
              <div class="method-card-header">
                <div class="method-card-title-wrap">
                  <span class="method-card-name">{{ m.nome }}</span>
                  <span *ngIf="isMethodDefault(m.id)" class="badge-default-pill">★ Padrão</span>
                  <span class="banco-tag" *ngIf="m.instituicaoBanco">{{ m.instituicaoBanco }}</span>
                </div>
                <span class="badge" [ngClass]="m.ativo ? 'badge-success' : 'badge-danger'">
                  {{ m.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </div>

              <!-- Metadados: Modalidade, Fechamento e Vencimento -->
              <div class="method-card-body">
                <div class="meta-item">
                  <span class="meta-label">Modalidade:</span>
                  <span class="badge" [ngClass]="getModalidadeClass(m.modalidade)">
                    {{ getModalidadeLabel(m.modalidade) }}
                  </span>
                </div>
                <div class="meta-item" *ngIf="m.diaFechamento || m.diaVencimento">
                  <span class="meta-label">Fatura:</span>
                  <span class="day-badge" *ngIf="m.diaFechamento">Fecha {{ m.diaFechamento }}</span>
                  <span class="day-badge highlight-due" *ngIf="m.diaVencimento">Vence {{ m.diaVencimento }}</span>
                </div>
              </div>

              <!-- Ações Mobile -->
              <div class="method-card-actions">
                <button
                  (click)="openEditModal(m)"
                  class="btn btn-outline btn-sm mobile-action-btn"
                  title="Editar meio de pagamento"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Editar</span>
                </button>
                <button
                  (click)="toggleStatus(m)"
                  class="btn btn-secondary btn-sm mobile-action-btn"
                  [title]="m.ativo ? 'Desativar meio' : 'Ativar meio'"
                >
                  {{ m.ativo ? 'Desativar' : 'Ativar' }}
                </button>
                <button
                  (click)="promptDeleteMethod(m)"
                  class="btn btn-danger btn-sm mobile-action-btn"
                  title="Excluir meio de pagamento"
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

        <div *ngIf="!loading && methods.length === 0" class="empty-state">
          <p>Nenhum meio de pagamento cadastrado.</p>
        </div>
      </div>

      <!-- Modal de Cadastro / Adição -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-with-icon">
              <div class="icon-circle icon-circle-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div>
                <h3>{{ editingId ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento' }}</h3>
                <p class="modal-subtitle">Preencha as informações do cartão, conta ou modalidade</p>
              </div>
            </div>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveMethod()" #modalForm="ngForm">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Meio de Pagamento (Nome) *</label>
                <input
                  type="text"
                  name="nome"
                  [(ngModel)]="newMethod.nome"
                  required
                  class="form-control"
                  placeholder="ex: Nubank Ultravioleta, Itaú Click, etc."
                />
              </div>

              <div class="form-group">
                <label class="form-label">Modalidade *</label>
                <app-searchable-dropdown
                  [options]="modalidadeOptions"
                  valueField="value"
                  labelField="label"
                  sublabelField="sublabel"
                  [(ngModel)]="newMethod.modalidade"
                  name="modalidade"
                  [showSearch]="false"
                  [clearable]="false"
                  placeholder="Selecione a modalidade..."
                ></app-searchable-dropdown>
              </div>

              <div class="form-row" *ngIf="newMethod.modalidade === 'CREDITO'">
                <div class="form-group">
                  <label class="form-label">Dia de Fechamento da Fatura (1 a 31) *</label>
                  <input
                    type="number"
                    name="diaFechamento"
                    min="1"
                    max="31"
                    [(ngModel)]="newMethod.diaFechamento"
                    required
                    class="form-control"
                    placeholder="ex: 25"
                  />
                  <small class="text-muted text-xs">
                    Compras feitas a partir deste dia vão para a fatura do próximo mês.
                  </small>
                </div>

                <div class="form-group">
                  <label class="form-label">Dia de Vencimento da Fatura (1 a 31) *</label>
                  <input
                    type="number"
                    name="diaVencimento"
                    min="1"
                    max="31"
                    [(ngModel)]="newMethod.diaVencimento"
                    required
                    class="form-control"
                    placeholder="ex: 5"
                  />
                  <small class="text-muted text-xs">
                    Dia em que o valor vence para pagamento.
                  </small>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Banco *</label>
                <app-searchable-dropdown
                  [options]="bankOptions"
                  [(ngModel)]="newMethod.instituicaoBanco"
                  name="instituicaoBanco"
                  placeholder="Selecione ou digite o banco..."
                  searchPlaceholder="Pesquisar instituição financeira..."
                  [allowCreate]="true"
                  createOptionText="+ Inserir outro banco:"
                  (createNew)="newMethod.instituicaoBanco = $event"
                  [invalid]="modalForm.submitted && !newMethod.instituicaoBanco"
                ></app-searchable-dropdown>
              </div>

              <div class="status-switch-box">
                <label class="switch-container">
                  <input
                    type="checkbox"
                    name="definirComoPadrao"
                    [(ngModel)]="definirComoPadrao"
                  />
                  <span class="switch-slider"></span>
                </label>
                <div class="switch-label-text">
                  <strong>Definir como meio de pagamento padrão</strong>
                  <span class="text-xs text-muted block">Será pré-selecionado automaticamente ao abrir novos lançamentos</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button
                type="submit"
                [disabled]="!modalForm.valid || saving"
                class="btn btn-primary btn-pill"
              >
                <span *ngIf="!saving">{{ editingId ? 'Salvar Alterações' : 'Salvar Meio de Pagamento' }}</span>
                <span *ngIf="saving" class="btn-spinner-wrap">
                  <span class="mini-spinner"></span>
                  Salvando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação Reutilizável para Exclusão de Meio de Pagamento -->
      <app-confirm-modal
        [isOpen]="showDeleteModal"
        [title]="'Excluir Meio de Pagamento'"
        [message]="'Tem certeza que deseja excluir este meio de pagamento? Todas as compras e parcelas vinculadas a este meio serão excluídas do sistema.'"
        [itemName]="methodToDelete ? (methodToDelete.nome + ' (' + methodToDelete.instituicaoBanco + ')') : ''"
        [confirmText]="'Sim, Excluir'"
        [cancelText]="'Cancelar'"
        [variant]="'danger'"
        [loading]="deleting"
        (confirm)="confirmDeleteMethod()"
        (cancel)="cancelDeleteMethod()"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .payment-methods-page {
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

    .status-switch-box {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 0.85rem !important;
      background: #f8fafc !important;
      padding: 0.85rem 1rem !important;
      border-radius: 12px !important;
      border: 1px solid var(--gray-200, #e2e8f0) !important;
      margin-top: 1rem !important;
      margin-bottom: 0.5rem !important;
      width: 100% !important;
      box-sizing: border-box !important;
      text-align: left !important;
    }

    .switch-container {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
      margin: 0;
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

    .switch-label-text {
      display: flex !important;
      flex-direction: column !important;
      gap: 0.2rem !important;
      text-align: left !important;
      flex: 1 1 auto;
    }

    .switch-label-text strong {
      display: block !important;
      font-size: 0.88rem !important;
      font-weight: 600 !important;
      color: #0b132b !important;
      line-height: 1.3 !important;
    }

    .switch-label-text span,
    .switch-label-text .block,
    .switch-label-text .text-muted {
      display: block !important;
      font-size: 0.75rem !important;
      color: var(--gray-500, #64748b) !important;
      line-height: 1.35 !important;
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

    .day-badge {
      background: var(--gray-100);
      color: var(--gray-800);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .highlight-due {
      background: #eff6ff;
      color: #1e40af;
      font-weight: 700;
    }

    .banco-tag {
      font-weight: 500;
      color: var(--gray-700);
    }

    .text-center { text-align: center !important; }
    .text-muted { color: var(--gray-500); }
    .text-xs { font-size: 0.75rem; }

    .modal-content {
      background: #ffffff;
      border-radius: 20px;
      border: 1.5px solid rgba(0, 74, 173, 0.18);
      box-shadow: 0 25px 60px rgba(11, 19, 43, 0.24), 0 4px 16px rgba(0, 74, 173, 0.08);
      padding: 1.75rem;
      max-width: 540px;
      max-height: calc(100vh - 2.5rem);
      max-height: calc(100dvh - 2.5rem);
      display: flex;
      flex-direction: column;
      margin: auto;
      box-sizing: border-box;
      position: relative;
    }

    .modal-content form {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--gray-200);
      flex-shrink: 0;
    }

    .modal-header h3 {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.2rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
    }

    .modal-body {
      flex: 1 1 auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      max-height: calc(100vh - 13rem);
      max-height: calc(100dvh - 13rem);
      padding: 0.25rem 0.25rem 0.5rem 0;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
      flex-shrink: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--gray-400);
    }

    .table-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

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

    /* Cards Mobile de Meios de Pagamento */
    .method-mobile-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0, 74, 173, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .method-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .method-card-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .method-card-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.05rem;
      font-weight: 700;
      color: #0b132b;
    }

    .method-card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.45rem 0;
      border-top: 1px dashed var(--gray-200);
      border-bottom: 1px dashed var(--gray-200);
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .meta-label {
      color: var(--gray-500);
      font-size: 0.78rem;
    }

    .method-card-actions {
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
export class PaymentMethodsComponent implements OnInit {
  methods: PaymentMethod[] = [];
  loading: boolean = true;
  showModal: boolean = false;
  saving: boolean = false;
  editingId: string | null = null;
  definirComoPadrao: boolean = false;

  newMethod: CreatePaymentMethodDto = {
    nome: '',
    modalidade: 'CREDITO' as ModalidadePagamento,
    diaFechamento: 25,
    diaVencimento: 5,
    instituicaoBanco: '',
    ativo: true,
  };

  modalidadeOptions = [
    { value: 'CREDITO', label: 'Cartão de Crédito', sublabel: 'Fatura mensal com fechamento e vencimento' },
    { value: 'DEBITO', label: 'Cartão de Débito', sublabel: 'Débito imediato em conta corrente' },
    { value: 'DINHEIRO_CONTA', label: 'Dinheiro / Saldo em Conta', sublabel: 'Dinheiro em espécie ou Pix' },
    { value: 'OUTRO', label: 'Outro / Boleto / Financiamento', sublabel: 'Outras formas de pagamento' },
  ];

  bankOptions: string[] = [
    'Nubank',
    'Itaú',
    'Bradesco',
    'Banco do Brasil',
    'Santander',
    'Caixa Econômica',
    'Inter',
    'C6 Bank',
    'Mercado Pago',
    'PicPay',
    'BTG Pactual',
    'Sicredi',
    'Sicoob',
    'XP Investimentos',
  ];

  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly preferencesService: ExpensePreferencesService,
  ) {}

  ngOnInit() {
    this.loadMethods();
    this.preferencesService.loadPreferences().subscribe({ error: () => {} });
  }

  isMethodDefault(id: string): boolean {
    return this.preferencesService.currentPreferences?.meioPagamentoPadraoId === id;
  }

  loadMethods() {
    this.loading = true;
    this.paymentMethodsService.getAll(false).subscribe({
      next: (data) => {
        this.methods = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar meios de pagamento:', err);
        this.loading = false;
      },
    });
  }

  getModalidadeClass(modalidade: string): string {
    switch (modalidade) {
      case 'CREDITO': return 'badge-primary';
      case 'DEBITO': return 'badge-warning';
      case 'DINHEIRO_CONTA': return 'badge-success';
      default: return 'badge-gray';
    }
  }

  getModalidadeLabel(modalidade: string): string {
    switch (modalidade) {
      case 'CREDITO': return 'Cartão de Crédito';
      case 'DEBITO': return 'Cartão de Débito';
      case 'DINHEIRO_CONTA': return 'Dinheiro / Conta';
      default: return 'Outro / Boleto';
    }
  }

  openAddModal() {
    this.editingId = null;
    this.newMethod = {
      nome: '',
      modalidade: 'CREDITO',
      diaFechamento: 25,
      diaVencimento: 5,
      instituicaoBanco: '',
      ativo: true,
    };
    this.definirComoPadrao = false;
    this.showModal = true;
  }

  openEditModal(method: PaymentMethod) {
    this.editingId = method.id;
    this.newMethod = {
      nome: method.nome,
      modalidade: method.modalidade,
      diaFechamento: method.diaFechamento || 25,
      diaVencimento: method.diaVencimento || 5,
      instituicaoBanco: method.instituicaoBanco,
      ativo: method.ativo,
    };
    this.definirComoPadrao = this.isMethodDefault(method.id);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.definirComoPadrao = false;
  }

  saveMethod() {
    this.saving = true;

    if (this.editingId) {
      const id = this.editingId;
      this.paymentMethodsService.update(id, this.newMethod).subscribe({
        next: () => {
          if (this.definirComoPadrao) {
            this.preferencesService.setDefaultPaymentMethod(id).subscribe({ error: () => {} });
          } else if (this.isMethodDefault(id)) {
            this.preferencesService.setDefaultPaymentMethod(null).subscribe({ error: () => {} });
          }
          this.saving = false;
          this.closeModal();
          this.loadMethods();
        },
        error: (err) => {
          this.saving = false;
          alert('Erro ao atualizar meio de pagamento: ' + (err.error?.message || err.message));
        },
      });
    } else {
      this.paymentMethodsService.create(this.newMethod).subscribe({
        next: (created) => {
          if (this.definirComoPadrao && created?.id) {
            this.preferencesService.setDefaultPaymentMethod(created.id).subscribe({ error: () => {} });
          }
          this.saving = false;
          this.closeModal();
          this.loadMethods();
        },
        error: (err) => {
          this.saving = false;
          alert('Erro ao salvar meio de pagamento: ' + (err.error?.message || err.message));
        },
      });
    }
  }

  toggleStatus(method: PaymentMethod) {
    this.paymentMethodsService.update(method.id, { ativo: !method.ativo }).subscribe({
      next: () => this.loadMethods(),
      error: (err) => alert('Erro ao alterar status: ' + err.message),
    });
  }

  showDeleteModal = false;
  methodToDelete: PaymentMethod | null = null;
  deleting = false;

  promptDeleteMethod(method: PaymentMethod) {
    this.methodToDelete = method;
    this.showDeleteModal = true;
  }

  cancelDeleteMethod() {
    this.showDeleteModal = false;
    this.methodToDelete = null;
  }

  confirmDeleteMethod() {
    if (!this.methodToDelete) return;
    this.deleting = true;
    this.paymentMethodsService.delete(this.methodToDelete.id, true).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.methodToDelete = null;
        this.loadMethods();
      },
      error: (err) => {
        this.deleting = false;
        alert('Erro ao excluir meio de pagamento: ' + (err.error?.message || err.message));
      },
    });
  }
}
