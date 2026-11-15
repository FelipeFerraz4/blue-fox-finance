import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { AccessibilityService } from '../../../../core/services/accessibility/accessibility.service';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { I18N } from '../../../../core/i18n/i18n.pipes';

/**
 * Barra de acessibilidade flutuante (todas as páginas): A-, A+, restaurar, alto contraste,
 * leitura em voz alta e tema claro/escuro. Fecha com Esc ou clicando fora.
 */
@Component({
  selector: 'app-a11y-toolbar',
  standalone: true,
  imports: [...I18N],
  templateUrl: './a11y-toolbar.component.html',
  styleUrl: './a11y-toolbar.component.css',
})
export class A11yToolbarComponent {
  readonly a11y = inject(AccessibilityService);
  readonly theme = inject(ThemeService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly open = signal(false);

  toggle(): void {
    this.open.set(!this.open());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.host.nativeElement.querySelector<HTMLButtonElement>('.a11y-fab')?.focus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
