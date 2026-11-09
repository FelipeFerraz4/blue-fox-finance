import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { echarts } from './echarts.setup';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import {
  AnalyticsBasis,
  AnalyticsDimension,
  AnalyticsFact,
  DimensionSlice,
} from '../../../shared/model/types/analytics.model';
import { AnalyticsStore, MONTH_LABELS, MONTH_NAMES } from './analytics.store';
import {
  OTHERS_KEY,
  billsOptions,
  commitmentsOptions,
  monthlyChartOptions,
  rankedBarHeight,
  rankedBarOptions,
  topSlices,
} from './analytics-charts';
import { ChartCardComponent } from './chart-card/chart-card.component';
import { BillAlertsCardComponent } from '../bills/bill-alerts-card/bill-alerts-card.component';

type SortKey = 'data' | 'nome' | 'loja' | 'categoria' | 'meioPagamento' | 'valor';

interface RankedPanel {
  dim: AnalyticsDimension;
  title: string;
  subtitle: string;
  slices: DimensionSlice[];
}

const PAGE_SIZE = 12;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxEchartsDirective, ChartCardComponent, BillAlertsCardComponent],
  providers: [AnalyticsStore, provideEchartsCore({ echarts })],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(AnalyticsService);
  readonly store = inject(AnalyticsStore);

  readonly year = signal(new Date().getFullYear());
  readonly basis = signal<AnalyticsBasis>('compra');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Primeira carga mostra o estado de carregamento; recargas mantêm o desenho esmaecido. */
  readonly firstLoad = computed(() => this.loading() && !this.store.overview());
  readonly refreshing = computed(() => this.loading() && !!this.store.overview());
  readonly isCurrentYear = computed(() => this.year() === new Date().getFullYear());

  readonly selectedMonth = computed(() => this.store.filters().mes as number | undefined);
  readonly periodLabel = computed(() => {
    const mes = this.selectedMonth();
    return mes ? `${MONTH_NAMES[mes - 1]} de ${this.year()}` : `${this.year()}`;
  });
  readonly basisLabel = computed(() =>
    this.basis() === 'compra' ? 'pela data da compra' : 'pelo mês de vencimento das parcelas',
  );

  // ----- Gráficos -----------------------------------------------------------

  readonly monthlyOptions = computed(() =>
    monthlyChartOptions(
      this.store.monthly(),
      this.store.overview()?.anoAnterior ?? Array(12).fill(0),
      this.year(),
      this.selectedMonth(),
    ),
  );

  readonly rankedPanels = computed<RankedPanel[]>(() => [
    { dim: 'categoria', title: 'Por categoria', subtitle: 'Categoria do item comprado', slices: topSlices(this.store.byCategoria(), 8) },
    { dim: 'meioPagamentoId', title: 'Por meio de pagamento', subtitle: 'Cartões, Pix, dinheiro...', slices: topSlices(this.store.byMeio(), 8) },
    { dim: 'loja', title: 'Top lojas', subtitle: 'Onde você mais gastou', slices: topSlices(this.store.byLoja(), 10) },
    { dim: 'comprador', title: 'Por comprador', subtitle: 'Quem fez a compra', slices: topSlices(this.store.byComprador(), 8) },
    { dim: 'categoriaLoja', title: 'Por categoria de loja', subtitle: 'Tipo de estabelecimento', slices: topSlices(this.store.byCategoriaLoja(), 8) },
  ]);

  /** Opções por painel, recalculadas só quando dados ou seleção mudam. */
  readonly rankedOptions = computed(() => {
    const filters = this.store.filters();
    return Object.fromEntries(
      this.rankedPanels().map((p) => [p.dim, rankedBarOptions(p.slices, filters[p.dim] as string | undefined)]),
    );
  });

  readonly tipoSplit = computed(() => {
    const slices = this.store.byTipo();
    const total = slices.reduce((acc, s) => acc + s.total, 0);
    return slices.map((s) => ({ ...s, share: total > 0 ? s.total / total : 0 }));
  });

  readonly commitments = computed(() => this.store.overview()?.compromissosFuturos ?? null);
  readonly commitmentsChart = computed(() => {
    const fc = this.commitments();
    return fc ? commitmentsOptions(fc) : null;
  });

  readonly contas = computed(() => this.store.overview()?.contas ?? []);
  readonly hasBills = computed(() => this.contas().some((c) => c.quantidadePaga + c.quantidadePendente > 0));
  readonly billsChart = computed(() => billsOptions(this.contas(), this.selectedMonth()));
  readonly billsPeriod = computed(() => {
    const mes = this.selectedMonth();
    const list = mes ? this.contas().filter((c) => c.mes === mes) : this.contas();
    return list.reduce(
      (acc, c) => ({
        pago: acc.pago + c.pago,
        pendente: acc.pendente + c.pendente,
        atrasadas: acc.atrasadas + c.quantidadeAtrasada,
      }),
      { pago: 0, pendente: 0, atrasadas: 0 },
    );
  });

  // ----- Lista de gastos ----------------------------------------------------

  readonly sortKey = signal<SortKey>('data');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly page = signal(1);

  readonly sortedRows = computed(() => {
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.store.filtered()].sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'pt-BR') * dir;
    });
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedRows().length / PAGE_SIZE)));
  readonly pageRows = computed(() => {
    const page = Math.min(this.page(), this.totalPages());
    return this.sortedRows().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  });

  readonly monthLabels = MONTH_LABELS;
  readonly othersKey = OTHERS_KEY;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getOverview(this.year(), this.basis()).subscribe({
      next: (data) => {
        this.store.setOverview(data);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message;
        this.error.set(Array.isArray(message) ? message.join(' ') : message || 'Não foi possível carregar as análises.');
      },
    });
  }

  changeYear(delta: number): void {
    this.year.update((y) => y + delta);
    // Mês selecionado não faz sentido em outro ano; os demais filtros continuam
    this.store.clear('mes');
    this.load();
  }

  setBasis(basis: AnalyticsBasis): void {
    if (basis === this.basis()) return;
    this.basis.set(basis);
    this.load();
  }

  // ----- Cliques (filtro cruzado) ------------------------------------------

  /**
   * Torna a coluna (eixo x) ou a linha (eixo y) inteira clicável, não só a barra pintada:
   * barras curtas também são fáceis de acertar. O índice vem da posição do clique.
   */
  bindCategoryClick(chart: any, axis: 'x' | 'y', onIndex: (index: number) => void): void {
    const zr = chart.getZr();
    const indexAt = (e: any): number | null => {
      const point = [e.offsetX, e.offsetY];
      if (!chart.containPixel({ gridIndex: 0 }, point)) return null;
      const [x, y] = chart.convertFromPixel({ gridIndex: 0 }, point);
      const index = Math.round(axis === 'x' ? x : y);
      return Number.isFinite(index) && index >= 0 ? index : null;
    };
    zr.on('click', (e: any) => {
      const index = indexAt(e);
      if (index !== null) onIndex(index);
    });
    zr.on('mousemove', (e: any) => zr.setCursorStyle(indexAt(e) !== null ? 'pointer' : 'default'));
  }

  readonly monthIndexClick = (index: number): void => {
    if (index > 11) return;
    this.store.toggle('mes', index + 1);
    this.page.set(1);
  };

  /** Busca o painel atual no momento do clique (as fatias mudam com os filtros). */
  rankedIndexClick(dim: AnalyticsDimension): (index: number) => void {
    return (index: number) => {
      const slice = this.rankedPanels().find((p) => p.dim === dim)?.slices[index];
      if (slice && slice.key !== OTHERS_KEY) {
        this.store.toggle(dim, slice.key);
        this.page.set(1);
      }
    };
  }

  toggleTipo(key: string): void {
    this.store.toggle('tipo', key);
    this.page.set(1);
  }

  clearFilter(dim: AnalyticsDimension): void {
    this.store.clear(dim);
    this.page.set(1);
  }

  clearAll(): void {
    this.store.clearAll();
    this.page.set(1);
  }

  // ----- Tabela -------------------------------------------------------------

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set(key === 'valor' || key === 'data' ? 'desc' : 'asc');
    }
    this.page.set(1);
  }

  sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  goToPage(delta: number): void {
    this.page.update((p) => Math.min(this.totalPages(), Math.max(1, p + delta)));
  }

  rankedHeight(panel: RankedPanel): string {
    return `${rankedBarHeight(panel.slices.length)}px`;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
  }

  formatMonthRef(ref: string): string {
    const [y, m] = ref.split('-').map(Number);
    return `${MONTH_LABELS[m - 1]}/${y}`;
  }

  trackFact = (_: number, f: AnalyticsFact) => f.id;
}
