import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notice-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="notice-modal-backdrop" (click)="onClose()">
      <div class="notice-modal-card" (click)="$event.stopPropagation()">
        <div class="notice-modal-header">
          <div class="notice-icon-box" [ngClass]="type">
            <img
              *ngIf="type === 'keycloak'"
              src="assets/logo.png"
              alt="BlueFox Finance"
              class="notice-fox-img"
            />
            <svg *ngIf="type === 'info'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <svg *ngIf="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg *ngIf="type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="header-titles">
            <div class="title-row">
              <h2 class="notice-title">{{ title }}</h2>
              <span *ngIf="badge" class="notice-badge">{{ badge }}</span>
            </div>
          </div>
          <button class="btn-close" (click)="onClose()" aria-label="Fechar modal">✕</button>
        </div>

        <div class="notice-modal-body">
          <p class="notice-message">{{ message }}</p>
          <div *ngIf="details" class="notice-details-box">
            <p>{{ details }}</p>
          </div>
        </div>

        <div class="notice-modal-footer">
          <button
            type="button"
            (click)="onConfirm()"
            class="btn btn-primary btn-pill btn-confirm"
          >
            {{ confirmText || 'Entendi' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notice-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: rgba(11, 19, 43, 0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1.5rem 1rem;
      box-sizing: border-box;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      animation: backdropFade 0.2s ease-out;
    }

    @keyframes backdropFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .notice-modal-card {
      background: #ffffff;
      border-radius: 18px;
      width: 100%;
      max-width: 480px;
      margin: auto;
      box-shadow: 0 20px 45px rgba(0, 74, 173, 0.22), 0 4px 16px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(0, 74, 173, 0.14);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: calc(100dvh - 2rem);
      animation: modalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalSlide {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .notice-modal-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.35rem 1.5rem 1rem;
      padding-right: 3rem;
      border-bottom: 1px solid rgba(0, 74, 173, 0.08);
      position: relative;
      flex-shrink: 0;
    }

    .notice-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notice-icon-box.keycloak,
    .notice-icon-box.info {
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.2) 0%, rgba(0, 74, 173, 0.2) 100%);
      color: #004aad;
    }

    .notice-fox-img {
      width: 30px;
      height: 30px;
      object-fit: contain;
    }

    .notice-icon-box.warning {
      background: #fef3c7;
      color: #d97706;
    }

    .notice-icon-box.success {
      background: #dcfce7;
      color: #15803d;
    }

    .header-titles {
      flex: 1;
      min-width: 0;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .notice-title {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--gray-900, #0b132b);
      margin: 0;
      line-height: 1.25;
    }

    .notice-badge {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #004aad;
      background: #eff6ff;
      border: 1px solid rgba(56, 182, 255, 0.4);
      padding: 0.15rem 0.5rem;
      border-radius: 50px;
      white-space: nowrap;
    }

    .btn-close {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: transparent;
      border: none;
      color: var(--gray-400, #94a3b8);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.35rem;
      border-radius: 6px;
      transition: color 0.15s ease, background 0.15s ease;
    }

    .btn-close:hover {
      color: var(--gray-700, #334155);
      background: rgba(0, 0, 0, 0.05);
    }

    .notice-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .notice-message {
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.94rem;
      line-height: 1.55;
      color: var(--gray-700, #334155);
      margin: 0;
    }

    .notice-details-box {
      margin-top: 1rem;
      background: #f8fafc;
      border: 1px solid rgba(0, 74, 173, 0.1);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      color: var(--gray-600, #475569);
      line-height: 1.45;
    }

    .notice-details-box p {
      margin: 0;
    }

    .notice-modal-footer {
      padding: 0.85rem 1.5rem 1.25rem;
      display: flex;
      justify-content: flex-end;
      flex-shrink: 0;
      border-top: 1px solid rgba(0, 74, 173, 0.06);
    }

    .btn-confirm {
      min-width: 110px;
      padding: 0.65rem 1.5rem;
    }

    @media (max-width: 600px) {
      .notice-modal-backdrop {
        padding: 1rem 0.75rem;
        align-items: center;
      }

      .notice-modal-card {
        max-width: 100%;
        border-radius: 16px;
      }

      .notice-modal-header {
        padding: 1.1rem 1rem 0.85rem;
        padding-right: 2.75rem;
        gap: 0.75rem;
      }

      .notice-icon-box {
        width: 38px;
        height: 38px;
        border-radius: 10px;
      }

      .notice-title {
        font-size: 1.05rem;
      }

      .notice-modal-body {
        padding: 1.15rem 1rem;
      }

      .notice-message {
        font-size: 0.9rem;
      }

      .notice-details-box {
        margin-top: 0.75rem;
        padding: 0.75rem 0.85rem;
        font-size: 0.82rem;
      }

      .notice-modal-footer {
        padding: 0.75rem 1rem 1.1rem;
      }

      .btn-confirm {
        width: 100%;
      }
    }
  `],
})
export class NoticeModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Aviso do Sistema';
  @Input() message = '';
  @Input() details = '';
  @Input() badge = '';
  @Input() confirmText = 'Entendi';
  @Input() type: 'keycloak' | 'info' | 'warning' | 'success' = 'info';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
    this.close.emit();
  }
}
