import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notice-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notice-modal.component.html',
  styleUrl: './notice-modal.component.css'
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
