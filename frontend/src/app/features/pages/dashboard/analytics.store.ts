import { Injectable, computed, signal } from '@angular/core';
import {
  AnalyticsDimension,
  AnalyticsFact,
  AnalyticsFilters,
  AnalyticsOverview,
  DimensionSlice,
} from '../../../shared/model/types/analytics.model';

export const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const DIMENSION_LABELS: Record<AnalyticsDimension, string> = {
  mes: 'Mês',
  categoria: 'Categoria',
  meioPagamentoId: 'Meio de pagamento',
  loja: 'Loja',
  comprador: 'Comprador',
  categoriaLoja: 'Categoria de loja',
  tipo: 'Tipo',
};

export const TIPO_LABELS: Record<string, string> = { A_VISTA: 'À vista', PARCELADO: 'Parcelado' };

const SEM_CATEGORIA_LOJA = 'Sem categoria';

/** Valor da dimensão numa linha (o que o filtro compara). */
function keyOf(fact: AnalyticsFact, dim: AnalyticsDimension): string | number {
  if (dim === 'categoriaLoja') return fact.categoriaLoja ?? SEM_CATEGORIA_LOJA;
  return fact[dim];
}

/**
 * Estado da página de Análises (escopo do componente).
 * Regra Power BI: cada painel agrega com todos os filtros, exceto o da própria dimensão,
 * para continuar mostrando todas as barras com a selecionada destacada.
 */
@Injectable()
export class AnalyticsStore {
  readonly overview = signal<AnalyticsOverview | null>(null);
  readonly filters = signal<AnalyticsFilters>({});

  readonly facts = computed(() => this.overview()?.facts ?? []);
  readonly year = computed(() => this.overview()?.year ?? new Date().getFullYear());

  /** Linhas com todos os filtros aplicados (KPIs e lista). */
  readonly filtered = computed(() => this.applyFilters());

  readonly activeFilters = computed(() =>
    (Object.entries(this.filters()) as [AnalyticsDimension, string | number][]).map(([dim, value]) => ({
      dim,
      label: DIMENSION_LABELS[dim],
      value: this.valueLabel(dim, value),
    })),
  );

  /** Filtros além do mês: o comparativo com o ano anterior só vale sem eles. */
  readonly hasNonMonthFilters = computed(() =>
    Object.keys(this.filters()).some((dim) => dim !== 'mes'),
  );

  /** Totais por mês (índice 0 = janeiro), ignorando o filtro de mês. */
  readonly monthly = computed(() => {
    const totals = Array<number>(12).fill(0);
    for (const f of this.applyFilters('mes')) totals[f.mes - 1] += f.valor;
    return totals.map((v) => Number(v.toFixed(2)));
  });

  readonly byCategoria = computed(() => this.slices('categoria'));
  readonly byMeio = computed(() => this.slices('meioPagamentoId', (f) => f.meioPagamento));
  readonly byLoja = computed(() => this.slices('loja'));
  readonly byComprador = computed(() => this.slices('comprador'));
  readonly byCategoriaLoja = computed(() => this.slices('categoriaLoja'));
  readonly byTipo = computed(() => this.slices('tipo', (f) => TIPO_LABELS[f.tipo]));

  /** Meses considerados no período (mês selecionado, ou até o mês atual no ano corrente). */
  readonly periodMonths = computed<number[]>(() => {
    const mes = this.filters().mes as number | undefined;
    if (mes) return [mes];
    const now = new Date();
    const last = this.year() === now.getFullYear() ? now.getMonth() + 1 : 12;
    return Array.from({ length: last }, (_, i) => i + 1);
  });

  readonly kpis = computed(() => {
    const rows = this.filtered();
    const total = rows.reduce((acc, f) => acc + f.valor, 0);
    const pagamentos = rows.length;
    const parcelado = rows.filter((f) => f.tipo === 'PARCELADO').reduce((acc, f) => acc + f.valor, 0);
    const months = this.periodMonths();
    // Parcelas de meses que ainda não chegaram (já agendadas nos cartões)
    const lastMonth = Math.max(...months);
    const agendado = rows
      .filter((f) => f.mes > lastMonth)
      .reduce((acc, f) => acc + f.valor, 0);
    const totalNoPeriodo = total - agendado;

    // Comparativo ano contra ano no mesmo período (só sem filtros de outras dimensões)
    let variacao: number | null = null;
    let totalAnterior: number | null = null;
    if (!this.hasNonMonthFilters()) {
      const anterior = this.overview()?.anoAnterior ?? [];
      const atual = this.monthly();
      const prev = months.reduce((acc, m) => acc + (anterior[m - 1] ?? 0), 0);
      const curr = months.reduce((acc, m) => acc + (atual[m - 1] ?? 0), 0);
      totalAnterior = Number(prev.toFixed(2));
      variacao = prev > 0 ? (curr - prev) / prev : null;
    }

    return {
      total: Number(total.toFixed(2)),
      agendado: Number(agendado.toFixed(2)),
      mediaMensal: months.length ? Number((totalNoPeriodo / months.length).toFixed(2)) : 0,
      pagamentos,
      percentualParcelado: total > 0 ? parcelado / total : 0,
      variacao,
      totalAnterior,
    };
  });

  setOverview(overview: AnalyticsOverview): void {
    this.overview.set(overview);
  }

  /** Clique num item: aplica o filtro, ou remove se já estava selecionado. */
  toggle(dim: AnalyticsDimension, value: string | number): void {
    this.filters.update((current) => {
      const next = { ...current };
      if (next[dim] === value) delete next[dim];
      else next[dim] = value;
      return next;
    });
  }

  clear(dim: AnalyticsDimension): void {
    this.filters.update((current) => {
      const next = { ...current };
      delete next[dim];
      return next;
    });
  }

  clearAll(): void {
    this.filters.set({});
  }

  isSelected(dim: AnalyticsDimension, value: string | number): boolean {
    return this.filters()[dim] === value;
  }

  private applyFilters(except?: AnalyticsDimension): AnalyticsFact[] {
    const active = (Object.entries(this.filters()) as [AnalyticsDimension, string | number][]).filter(
      ([dim]) => dim !== except,
    );
    if (active.length === 0) return this.facts();
    return this.facts().filter((f) => active.every(([dim, value]) => keyOf(f, dim) === value));
  }

  private slices(dim: AnalyticsDimension, labelOf?: (f: AnalyticsFact) => string): DimensionSlice[] {
    const map = new Map<string, DimensionSlice>();
    for (const f of this.applyFilters(dim)) {
      const key = String(keyOf(f, dim));
      const slice = map.get(key) ?? { key, label: labelOf ? labelOf(f) : key, total: 0, count: 0 };
      slice.total += f.valor;
      slice.count += 1;
      map.set(key, slice);
    }
    return [...map.values()]
      .map((s) => ({ ...s, total: Number(s.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }

  private valueLabel(dim: AnalyticsDimension, value: string | number): string {
    if (dim === 'mes') return MONTH_NAMES[Number(value) - 1];
    if (dim === 'tipo') return TIPO_LABELS[String(value)] ?? String(value);
    if (dim === 'meioPagamentoId') {
      return this.facts().find((f) => f.meioPagamentoId === value)?.meioPagamento ?? String(value);
    }
    return String(value);
  }
}
