import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalVariant = 'danger' | 'warning' | 'primary' | 'info';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
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
