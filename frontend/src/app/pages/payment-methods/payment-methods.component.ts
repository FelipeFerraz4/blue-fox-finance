import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { PaymentMethod, CreatePaymentMethodDto, ModalidadePagamento } from '../../models/payment-method.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="payment-methods-page">
      <div class="page-header">
        <div class="page-header-content">
          <div class="header-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="title-with-pill">
              <h1 class="page-title">Meios de Pagamento</h1>
              <span class="badge badge-brand">Cartões & Contas</span>
            </div>
            <p class="page-subtitle">
              Cadastre seus cartões de crédito com dias de fechamento e vencimento para projeção exata das faturas futuras
            </p>
          </div>
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

        <div class="table-responsive" *ngIf="!loading && methods.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Meio de Pagamento</th>
                <th>Modalidade</th>
                <th class="text-center">Dia de Fechamento</th>
                <th class="text-center">Dia de Vencimento</th>
                <th>Instituição / Banco</th>
                <th class="text-center">Status</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of methods">
                <td>
                  <div class="method-name-col">
                    <strong class="text-gray-900">{{ m.nome }}</strong>
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

        <div *ngIf="!loading && methods.length === 0" class="empty-state">
          <p>Nenhum meio de pagamento cadastrado.</p>
        </div>
      </div>

      <!-- Modal de Cadastro / Adição -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Adicionar Novo Meio de Pagamento</h3>
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
                <select
                  name="modalidade"
                  [(ngModel)]="newMethod.modalidade"
                  required
                  class="form-control"
                >
                  <option value="CREDITO">Cartão de Crédito</option>
                  <option value="DEBITO">Cartão de Débito</option>
                  <option value="DINHEIRO_CONTA">Dinheiro / Saldo em Conta</option>
                  <option value="OUTRO">Outro / Boleto / Financiamento</option>
                </select>
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
                    Dia em que o valor é debitado / vence para pagamento.
                  </small>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Instituição / Banco *</label>
                <input
                  type="text"
                  name="instituicaoBanco"
                  [(ngModel)]="newMethod.instituicaoBanco"
                  required
                  class="form-control"
                  placeholder="ex: Nubank, Itaú, Bradesco, Santander..."
                />
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button
                type="submit"
                [disabled]="!modalForm.valid || saving"
                class="btn btn-primary"
              >
                {{ saving ? 'Salvando...' : 'Salvar Meio de Pagamento' }}
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

    .table-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }
  `],
})
export class PaymentMethodsComponent implements OnInit {
  methods: PaymentMethod[] = [];
  loading: boolean = true;
  showModal: boolean = false;
  saving: boolean = false;

  newMethod: CreatePaymentMethodDto = {
    nome: '',
    modalidade: 'CREDITO' as ModalidadePagamento,
    diaFechamento: 25,
    diaVencimento: 5,
    instituicaoBanco: '',
    ativo: true,
  };

  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  ngOnInit() {
    this.loadMethods();
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
    this.newMethod = {
      nome: '',
      modalidade: 'CREDITO',
      diaFechamento: 25,
      diaVencimento: 5,
      instituicaoBanco: '',
      ativo: true,
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveMethod() {
    this.saving = true;
    this.paymentMethodsService.create(this.newMethod).subscribe({
      next: () => {
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
