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
            <svg *ngIf="type === 'keycloak' || type === 'info'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
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
          <div>
            <div class="title-row">
              <h2 class="notice-title">{{ title }}</h2>
              <span *ngIf="badge" class="notice-badge">{{ badge }}</span>
            </div>
          </div>
          <button class="btn-close" (click)="onClose()">✕</button>
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
      right: 0;
      bottom: 0;
      background: rgba(11, 19, 43, 0.65);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2100;
      padding: 1rem;
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
      max-width: 460px;
      box-shadow: 0 20px 45px rgba(0, 74, 173, 0.18), 0 4px 16px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(0, 74, 173, 0.14);
      overflow: hidden;
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
      border-bottom: 1px solid rgba(0, 74, 173, 0.08);
      position: relative;
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

    .notice-icon-box.warning {
      background: #fef3c7;
      color: #d97706;
    }

    .notice-icon-box.success {
      background: #dcfce7;
      color: #15803d;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .notice-title {
      font-family: var(--font-outfit), sans-serif;
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--gray-900);
      margin: 0;
    }

    .notice-badge {
      font-family: var(--font-outfit), sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #004aad;
      background: #eff6ff;
      border: 1px solid rgba(56, 182, 255, 0.4);
      padding: 0.15rem 0.5rem;
      border-radius: 50px;
    }

    .btn-close {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: transparent;
      border: none;
      color: var(--gray-400);
      font-size: 1.1rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.25rem;
    }

    .btn-close:hover {
      color: var(--gray-700);
    }

    .notice-modal-body {
      padding: 1.5rem;
    }

    .notice-message {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.94rem;
      line-height: 1.55;
      color: var(--gray-700);
      margin: 0;
    }

    .notice-details-box {
      margin-top: 1rem;
      background: #f8fafc;
      border: 1px solid rgba(0, 74, 173, 0.1);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      color: var(--gray-600);
      line-height: 1.45;
    }

    .notice-modal-footer {
      padding: 0.85rem 1.5rem 1.25rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn-confirm {
      min-width: 110px;
      padding: 0.65rem 1.5rem;
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
