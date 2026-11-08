import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BillsService } from '../../../../core/services/bills/bills.service';
import { BillOccurrence } from '../../../../shared/model/types/bill.model';

/** Card do dashboard com contas atrasadas, vencendo hoje e próximas. */
@Component({
  selector: 'app-bill-alerts-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bill-alerts-card.component.html',
  styleUrl: './bill-alerts-card.component.css',
})
export class BillAlertsCardComponent implements OnInit {
  private readonly billsService = inject(BillsService);

  readonly alerts = this.billsService.alerts;
  readonly items = computed<BillOccurrence[]>(() => {
    const a = this.alerts();
    return a ? [...a.atrasadas, ...a.venceHoje, ...a.proximas] : [];
  });

  ngOnInit(): void {
    this.billsService.refreshAlerts();
  }

  label(o: BillOccurrence): string {
    if (o.status === 'ATRASADA') {
      const dias = Math.abs(o.diasParaVencer);
      return `Atrasada há ${dias} dia${dias > 1 ? 's' : ''}`;
    }
    if (o.status === 'VENCE_HOJE') return 'Vence hoje';
    return o.diasParaVencer === 1 ? 'Vence amanhã' : `Vence em ${o.diasParaVencer} dias`;
  }
}
