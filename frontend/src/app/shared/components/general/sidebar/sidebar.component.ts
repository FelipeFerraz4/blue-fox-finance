import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../../../core/services/sidebar/sidebar.service';
import { BillsService } from '../../../../core/services/bills/bills.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  /** Contas precisando de atenção: atrasadas, vencendo hoje e próximas. */
  readonly alertCount = computed(() => this.billsService.alerts()?.total ?? 0);
  readonly hasOverdue = computed(() => (this.billsService.alerts()?.atrasadas.length ?? 0) > 0);

  constructor(
    public readonly sidebarService: SidebarService,
    private readonly billsService: BillsService,
  ) {}

  ngOnInit(): void {
    this.billsService.refreshAlerts();
  }
}
