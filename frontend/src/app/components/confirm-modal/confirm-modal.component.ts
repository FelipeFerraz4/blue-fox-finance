import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalVariant = 'danger' | 'warning' | 'primary' | 'info';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="confirm-modal-backdrop" (click)="onBackdropClick($event)">
      <div class="confirm-modal-dialog" [class]="'modal-' + variant" (click)="$event.stopPropagation()">
        <!-- Ícone do Cabeçalho baseado na Variante -->
        <div class="modal-icon-badge" [class]="'badge-' + variant">
          <!-- Danger: Lixeira / Alerta Crítico -->
          <svg *ngIf="variant === 'danger'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>

          <!-- Warning: Triângulo de Aviso -->
          <svg *ngIf="variant === 'warning'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>

          <!-- Primary: Check ou Ação Principal -->
          <svg *ngIf="variant === 'primary'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 14 14"/>
          </svg>

          <!-- Info: Informação -->
          <svg *ngIf="variant === 'info'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="modal-body-content">
          <h3 class="modal-title">{{ title }}</h3>
          
          <p class="modal-message">{{ message }}</p>

          <!-- Item em Destaque (Opcional) -->
          <div *ngIf="itemName" class="modal-item-highlight">
            <span class="highlight-label">Item selecionado:</span>
            <strong class="highlight-text">{{ itemName }}</strong>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="modal-actions-footer">
          <button
            type="button"
            class="btn btn-secondary"
            [disabled]="loading"
            (click)="onCancel()"
          >
            {{ cancelText }}
          </button>

          <button
            type="button"
            class="btn"
            [class]="'btn-' + variant"
            [disabled]="loading"
            (click)="onConfirm()"
          >
            <span *ngIf="!loading">{{ confirmText }}</span>
            <span *ngIf="loading" class="btn-spinner-wrap">
              <span class="mini-spinner"></span>
              Processando...
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.15s ease-out;
      padding: 1rem;
    }

    .confirm-modal-dialog {
      background: white;
      border-radius: 18px;
      box-shadow: 0 20px 45px rgba(0, 74, 173, 0.18);
      width: 100%;
      max-width: 440px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      animation: scaleUp 0.15s ease-out;
      border: 1px solid rgba(0, 74, 173, 0.12);
    }

    @media (max-width: 480px) {
      .confirm-modal-dialog {
        padding: 1.25rem 1rem;
        max-width: 92vw;
      }
    }

    .modal-icon-badge {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    /* Cores das Variantes de Ícone */
    .badge-danger {
      background: #fee2e2;
      color: #dc2626;
      border: 4px solid #fef2f2;
    }

    .badge-warning {
      background: #fef3c7;
      color: #d97706;
      border: 4px solid #fffbeb;
    }

    .badge-primary {
      background: #e4f0fc;
      color: #004aad;
      border: 4px solid #f8fafc;
    }

    .badge-info {
      background: #f1f5f9;
      color: #475569;
      border: 4px solid #f8fafc;
    }

    .modal-body-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .modal-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
    }

    .modal-message {
      font-size: 0.92rem;
      color: var(--gray-600);
      line-height: 1.5;
      margin: 0;
    }

    .modal-item-highlight {
      background: #f8fafc;
      border: 1px dashed rgba(0, 74, 173, 0.2);
      border-radius: 8px;
      padding: 0.6rem 0.85rem;
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      text-align: left;
    }

    .highlight-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--gray-500);
      font-weight: 600;
    }

    .highlight-text {
      font-size: 0.9rem;
      color: #0b132b;
      font-weight: 700;
      word-break: break-word;
    }

    .modal-actions-footer {
      display: flex;
      gap: 0.75rem;
      width: 100%;
      margin-top: 1.75rem;
    }

    .modal-actions-footer .btn {
      flex: 1;
      padding: 0.65rem 1rem;
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 0.92rem;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    /* Botões por Variante */
    .btn-danger {
      background: #dc2626;
      color: white;
      border: 1px solid #dc2626;
    }
    .btn-danger:hover:not(:disabled) {
      background: #b91c1c;
      border-color: #b91c1c;
    }

    .btn-warning {
      background: #d97706;
      color: white;
      border: 1px solid #d97706;
    }
    .btn-warning:hover:not(:disabled) {
      background: #b45309;
      border-color: #b45309;
    }

    .btn-primary {
      background: linear-gradient(135deg, #38b6ff 0%, #004aad 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(56, 182, 255, 0.35);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(56, 182, 255, 0.45);
    }

    .btn-info {
      background: #475569;
      color: white;
      border: 1px solid #475569;
    }
    .btn-info:hover:not(:disabled) {
      background: #334155;
      border-color: #334155;
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

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar Ação';
  @Input() message = 'Tem certeza que deseja executar esta ação?';
  @Input() itemName?: string;
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() variant: ModalVariant = 'danger';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen && !this.loading) {
      this.onCancel();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (!this.loading) {
      this.onCancel();
    }
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
