import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillsService } from '../../../core/services/bills/bills.service';
import { PaymentMethodsService } from '../../../core/services/payment-methods/payment-methods.service';
import {
  Bill,
  BillMonthOverview,
  BillOccurrence,
  BillStatus,
  CreateBillDto,
  RecorrenciaConta,
} from '../../../shared/model/types/bill.model';
import { DropdownOption } from '../../../shared/components/general/searchable-dropdown/searchable-dropdown.model';
import { ConfirmModalComponent } from '../../../shared/components/general/confirm-modal/confirm-modal.component';
import { NoticeModalComponent } from '../../../shared/components/general/notice-modal/notice-modal.component';
import { SearchableDropdownComponent } from '../../../shared/components/general/searchable-dropdown';

interface BillForm {
  nome: string;
  categoria: string;
  recorrencia: RecorrenciaConta;
  diaVencimento: number | null;
  mesVencimento: number | null;
  dataUnica: string;
  valorPrevisto: number | null;
  meioPagamentoId: string | null;
  lembrarDiasAntes: number;
  dataInicio: string;
  observacoes: string;
}

const STATUS_LABELS: Record<BillStatus, string> = {
  PAGA: 'Paga',
  ATRASADA: 'Atrasada',
  VENCE_HOJE: 'Vence hoje',
  PROXIMA: 'Em breve',
  PENDENTE: 'Pendente',
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmModalComponent,
    NoticeModalComponent,
    SearchableDropdownComponent,
  ],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css',
})
export class BillsComponent implements OnInit {
  private readonly billsService = inject(BillsService);
  private readonly paymentMethodsService = inject(PaymentMethodsService);

  // Estado da visão mensal
  readonly month = signal(this.currentMonth());
  readonly overview = signal<BillMonthOverview | null>(null);
  readonly loading = signal(true);

  // Cadastro de contas
  readonly bills = signal<Bill[]>([]);
  readonly showManage = signal(false);
  readonly cardOptions = signal<DropdownOption[]>([]);

  readonly monthLabel = computed(() => {
    const [y, m] = this.month().split('-').map(Number);
    return `${MONTH_NAMES[m - 1]} de ${y}`;
  });
  readonly isCurrentMonth = computed(() => this.month() === this.currentMonth());

  // Modal de conta
  showBillModal = false;
  editingBillId: string | null = null;
  form: BillForm = this.emptyForm();
  savingBill = false;

  // Modal de pagamento
  payingOccurrence: BillOccurrence | null = null;
  payValue: number | null = null;
  payDate = '';
  savingPay = false;

  // Confirmações
  billToDelete: Bill | null = null;
  occurrenceToUnpay: BillOccurrence | null = null;
  confirmLoading = false;

  // Avisos de erro
  noticeOpen = false;
  noticeMessage = '';

  readonly recorrenciaOptions: DropdownOption<RecorrenciaConta>[] = [
    { value: 'MENSAL', label: 'Mensal' },
    { value: 'ANUAL', label: 'Anual' },
    { value: 'UNICA', label: 'Avulsa' },
  ];

  readonly monthOptions: DropdownOption<number>[] = MONTH_NAMES.map((label, i) => ({
    value: i + 1,
    label,
  }));

  ngOnInit(): void {
    this.loadMonth();
    this.loadBills();
    this.paymentMethodsService.getAll(true).subscribe({
      next: (methods) =>
        this.cardOptions.set(
          methods
            .filter((m) => m.modalidade === 'CREDITO')
            .map((m) => ({
              value: m.id,
              label: m.nome,
              sublabel: m.diaVencimento ? `dia ${m.diaVencimento}` : '',
            })),
        ),
      error: () => this.cardOptions.set([]),
    });
  }

  // ---------------------------------------------------------------------------
  // Carregamento
  // ---------------------------------------------------------------------------

  loadMonth(): void {
    this.loading.set(true);
    this.billsService.getOccurrences(this.month()).subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.showError(err, 'Não foi possível carregar as contas do mês.');
      },
    });
    this.billsService.refreshAlerts();
  }

  loadBills(): void {
    this.billsService.getAll().subscribe({
      next: (bills) => this.bills.set(bills),
      error: (err) => this.showError(err, 'Não foi possível carregar o cadastro de contas.'),
    });
  }

  changeMonth(delta: number): void {
    const [y, m] = this.month().split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    this.month.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    this.loadMonth();
  }

  goToCurrentMonth(): void {
    this.month.set(this.currentMonth());
    this.loadMonth();
  }

  // ---------------------------------------------------------------------------
  // Pagamento
  // ---------------------------------------------------------------------------

  openPayModal(occurrence: BillOccurrence): void {
    this.payingOccurrence = occurrence;
    this.payValue = occurrence.valor;
    this.payDate = this.todayIso();
  }

  closePayModal(): void {
    this.payingOccurrence = null;
    this.savingPay = false;
  }

  confirmPay(): void {
    if (!this.payingOccurrence || this.payValue === null || this.payValue === undefined) return;
    this.savingPay = true;
    this.billsService
      .pay(this.payingOccurrence.id, { valorPago: Number(this.payValue), pagoEm: this.payDate })
      .subscribe({
        next: () => {
          this.closePayModal();
          this.loadMonth();
        },
        error: (err) => {
          this.savingPay = false;
          this.showError(err, 'Não foi possível registrar o pagamento.');
        },
      });
  }

  confirmUnpay(): void {
    if (!this.occurrenceToUnpay) return;
    this.confirmLoading = true;
    this.billsService.unpay(this.occurrenceToUnpay.id).subscribe({
      next: () => {
        this.confirmLoading = false;
        this.occurrenceToUnpay = null;
        this.loadMonth();
      },
      error: (err) => {
        this.confirmLoading = false;
        this.occurrenceToUnpay = null;
        this.showError(err, 'Não foi possível desfazer o pagamento.');
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Cadastro de contas
  // ---------------------------------------------------------------------------

  openNewBill(): void {
    this.editingBillId = null;
    this.form = this.emptyForm();
    this.showBillModal = true;
  }

  openEditBill(bill: Bill): void {
    this.editingBillId = bill.id;
    this.form = {
      nome: bill.nome,
      categoria: bill.categoria ?? '',
      recorrencia: bill.recorrencia,
      diaVencimento: bill.diaVencimento,
      mesVencimento: bill.mesVencimento,
      dataUnica: bill.dataUnica ? bill.dataUnica.slice(0, 10) : '',
      valorPrevisto: bill.valorPrevisto !== null ? Number(bill.valorPrevisto) : null,
      meioPagamentoId: bill.meioPagamentoId,
      lembrarDiasAntes: bill.lembrarDiasAntes,
      dataInicio: bill.dataInicio.slice(0, 7),
      observacoes: bill.observacoes ?? '',
    };
    this.showBillModal = true;
  }

  closeBillModal(): void {
    this.showBillModal = false;
    this.savingBill = false;
  }

  /** Ao vincular um cartão, sugere o dia de vencimento dele. */
  onCardChange(cardId: string | null): void {
    this.form.meioPagamentoId = cardId;
    const card = this.cardOptions().find((c) => c.value === cardId);
    const match = card?.sublabel?.match(/dia (\d+)/);
    if (match && !this.form.diaVencimento) {
      this.form.diaVencimento = Number(match[1]);
    }
    if (cardId && !this.form.nome && card) {
      this.form.nome = `Fatura ${card.label}`;
    }
  }

  saveBill(): void {
    const f = this.form;
    const dto: CreateBillDto = {
      nome: f.nome,
      categoria: f.categoria || null,
      recorrencia: f.recorrencia,
      diaVencimento: f.recorrencia === 'UNICA' ? null : f.diaVencimento,
      mesVencimento: f.recorrencia === 'ANUAL' ? f.mesVencimento : null,
      dataUnica: f.recorrencia === 'UNICA' ? f.dataUnica : null,
      // Conta vinculada a cartão usa o valor da fatura
      valorPrevisto: f.meioPagamentoId ? null : f.valorPrevisto ?? null,
      meioPagamentoId: f.meioPagamentoId || null,
      lembrarDiasAntes: Number(f.lembrarDiasAntes ?? 2),
      dataInicio: f.recorrencia === 'UNICA' ? undefined : `${f.dataInicio}-01`,
      observacoes: f.observacoes || null,
    };

    this.savingBill = true;
    const request = this.editingBillId
      ? this.billsService.update(this.editingBillId, dto)
      : this.billsService.create(dto);

    request.subscribe({
      next: () => {
        this.closeBillModal();
        this.loadBills();
        this.loadMonth();
      },
      error: (err) => {
        this.savingBill = false;
        this.showError(err, 'Não foi possível salvar a conta.');
      },
    });
  }

  toggleActive(bill: Bill): void {
    this.billsService.update(bill.id, { ativo: !bill.ativo }).subscribe({
      next: () => {
        this.loadBills();
        this.loadMonth();
      },
      error: (err) => this.showError(err, 'Não foi possível alterar a conta.'),
    });
  }

  confirmDeleteBill(): void {
    if (!this.billToDelete) return;
    this.confirmLoading = true;
    this.billsService.delete(this.billToDelete.id).subscribe({
      next: () => {
        this.confirmLoading = false;
        this.billToDelete = null;
        this.loadBills();
        this.loadMonth();
      },
      error: (err) => {
        this.confirmLoading = false;
        this.billToDelete = null;
        this.showError(err, 'Não foi possível excluir a conta.');
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Apresentação
  // ---------------------------------------------------------------------------

  statusLabel(o: BillOccurrence): string {
    if (o.status === 'PROXIMA') {
      return o.diasParaVencer === 1 ? 'Amanhã' : `Em ${o.diasParaVencer} dias`;
    }
    if (o.status === 'ATRASADA') {
      const dias = Math.abs(o.diasParaVencer);
      return `Atrasada ${dias}d`;
    }
    return STATUS_LABELS[o.status];
  }

  statusClass(status: BillStatus): string {
    switch (status) {
      case 'PAGA':
        return 'badge-success';
      case 'ATRASADA':
        return 'badge-danger';
      case 'VENCE_HOJE':
      case 'PROXIMA':
        return 'badge-warning';
      default:
        return 'badge-gray';
    }
  }

  recurrenceLabel(bill: Bill): string {
    switch (bill.recorrencia) {
      case 'MENSAL':
        return `Mensal · dia ${bill.diaVencimento}`;
      case 'ANUAL':
        return `Anual · ${bill.diaVencimento}/${String(bill.mesVencimento).padStart(2, '0')}`;
      default:
        return `Avulsa · ${this.formatDate(bill.dataUnica)}`;
    }
  }

  formatDate(iso: string | null): string {
    if (!iso) return '-';
    const d = new Date(iso);
    // Datas de vencimento são salvas ao meio-dia; usar UTC evita trocar de dia
    return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
  }

  formatMonth(month: string): string {
    const [y, m] = month.split('-').map(Number);
    return `${MONTH_NAMES[m - 1].slice(0, 3)}/${y}`;
  }

  private showError(err: any, fallback: string): void {
    const message = err?.error?.message;
    this.noticeMessage = Array.isArray(message) ? message.join(' ') : message || fallback;
    this.noticeOpen = true;
  }

  private emptyForm(): BillForm {
    return {
      nome: '',
      categoria: '',
      recorrencia: 'MENSAL',
      diaVencimento: null,
      mesVencimento: null,
      dataUnica: '',
      valorPrevisto: null,
      meioPagamentoId: null,
      lembrarDiasAntes: 2,
      dataInicio: this.currentMonth(),
      observacoes: '',
    };
  }

  private currentMonth(): string {
    return this.todayIso().slice(0, 7);
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
