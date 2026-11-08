import { Component, input } from '@angular/core';

/** Moldura dos painéis de Análises: título, legenda curta, estado vazio e recarga sem salto. */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.css',
  host: { class: 'chart-card' },
})
export class ChartCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly empty = input<boolean>(false);
  readonly emptyMessage = input<string>('Sem dados para o filtro atual.');
  readonly refreshing = input<boolean>(false);
}
