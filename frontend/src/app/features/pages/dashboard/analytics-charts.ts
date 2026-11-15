import type { EChartsCoreOption } from 'echarts/core';
import {
  BillsMonthSummary,
  DimensionSlice,
  FutureCommitments,
} from '../../../shared/model/types/analytics.model';
import { monthLabels, monthNames } from './analytics.store';
import { t } from '../../../core/i18n/i18n';
import { currencySymbol, formatMoney, formatMoneyCompact } from '../../../core/i18n/format';

// Paleta: uma série = azul da marca; selecionado cheio, demais esmaecidos.
// Uma versão por tema; setChartTheme() é chamado pelo dashboard quando o tema muda.
const LIGHT = {
  brand: '#004aad',
  brandMuted: '#b9cbe8',
  ghost: '#d9dee6', // "Outros" e séries agregadas
  ink: '#0b132b',
  inkSecondary: '#475569',
  muted: '#898781',
  grid: '#eef0f3',
  axis: '#cbd5e1',
  surface: '#ffffff',
  border: '#e2e8f0',
  emphasis: '#003780',
};
const DARK: typeof LIGHT = {
  brand: '#38b6ff',
  brandMuted: '#2b4f80',
  ghost: '#3a4668',
  ink: '#f1f5f9',
  inkSecondary: '#b4c0d4',
  muted: '#8b97b0',
  grid: '#1f2a4d',
  axis: '#34426e',
  surface: '#141d3a',
  border: '#26335a',
  emphasis: '#6cc6ff',
};
let P = LIGHT;
export function setChartTheme(theme: 'light' | 'dark'): void {
  P = theme === 'dark' ? DARK : LIGHT;
}
const STATUS_GOOD = '#0ca30c';
const STATUS_WARNING = '#fab219';

// Paleta categórica de referência, em ordem fixa (validada para daltonismo,
// vizinhos ΔE >= 9 sobre fundo branco). Usada só quando a cor identifica algo.
export const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];

export const OTHERS_KEY = '__outros__';

/** Moeda do país escolhido (o nome ficou formatBRL por histórico). */
export const formatBRL = (v: number) => formatMoney(v);
const axisBRL = (v: number) => (v === 0 ? '0' : v < 1000 ? `${currencySymbol()} ${Math.round(v)}` : formatMoneyCompact(v));

/** O tooltip do ECharts renderiza HTML: rótulos vindos do usuário precisam de escape. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

const tooltipRow = (color: string, name: string, value: number) =>
  `<div style="display:flex;align-items:center;gap:8px;margin-top:4px">` +
  `<span style="display:inline-block;width:12px;height:3px;border-radius:2px;background:${color}"></span>` +
  `<strong style="color:${P.ink}">${formatBRL(value)}</strong>` +
  `<span style="color:${P.inkSecondary}">${escapeHtml(name)}</span></div>`;

const base = (): EChartsCoreOption => ({
  animationDuration: 400,
  animationDurationUpdate: 300,
  textStyle: { fontFamily: 'Inter, -apple-system, "Segoe UI", sans-serif', color: P.inkSecondary },
  tooltip: {
    backgroundColor: P.surface,
    borderColor: P.border,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: P.ink, fontSize: 12 },
    extraCssText: 'box-shadow:0 8px 24px rgba(11,19,43,0.12);border-radius:10px;',
  },
});

const valueAxis = () => ({
  type: 'value',
  axisLabel: { color: P.muted, fontSize: 11, formatter: axisBRL },
  splitLine: { lineStyle: { color: P.grid, width: 1 } },
  axisLine: { show: false },
  axisTick: { show: false },
});

/**
 * Gastos por mês (barras horizontais, janeiro no topo). A comparação com o ano anterior
 * fica no tooltip, sem uma segunda barra.
 */
export function monthlyChartOptions(
  current: number[],
  previous: number[],
  year: number,
  selected: number | undefined,
): EChartsCoreOption {
  return {
    ...base(),
    grid: { left: 4, right: 72, top: 4, bottom: 4, containLabel: true },
    tooltip: {
      ...(base()['tooltip'] as object),
      trigger: 'item',
      formatter: (p: any) => {
        const i = p.dataIndex;
        const prev = previous[i] ?? 0;
        const comparison =
          prev > 0
            ? `${current[i] >= prev ? '▲' : '▼'} ${Math.abs(((current[i] - prev) / prev) * 100).toFixed(0)}% vs ${year - 1}`
            : t('{ano}: sem gastos', { ano: year - 1 });
        return (
          `<div style="font-weight:600;color:${P.ink}">${t('{mes} de {ano}', { mes: monthNames()[i], ano: year })}</div>` +
          `<div style="margin-top:4px"><strong>${formatBRL(current[i])}</strong></div>` +
          `<div style="color:${P.inkSecondary};margin-top:2px">${comparison}</div>`
        );
      },
    },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      inverse: true,
      data: monthLabels(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: P.inkSecondary, fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 16,
        cursor: 'pointer',
        data: current.map((value, i) => {
          const isSelected = selected === i + 1;
          const dimmed = selected !== undefined && !isSelected;
          return {
            value,
            itemStyle: { color: dimmed ? P.brandMuted : P.brand, borderRadius: [0, 4, 4, 0] },
            label: {
              show: value > 0,
              position: 'right',
              color: dimmed ? P.muted : P.ink,
              fontWeight: isSelected ? 700 : 600,
              fontSize: 11,
              formatter: () => axisBRL(value),
            },
          };
        }),
        emphasis: { itemStyle: { color: P.emphasis } },
      },
    ],
  };
}

/** Top N + "Outros" (o resto somado, não clicável). */
export function topSlices(slices: DimensionSlice[], topN: number): DimensionSlice[] {
  if (slices.length <= topN) return slices;
  const rest = slices.slice(topN);
  return [
    ...slices.slice(0, topN),
    {
      key: OTHERS_KEY,
      label: t('Outros ({n})', { n: rest.length }),
      total: Number(rest.reduce((acc, s) => acc + s.total, 0).toFixed(2)),
      count: rest.reduce((acc, s) => acc + s.count, 0),
    },
  ];
}

/** Barras horizontais ordenadas; a selecionada fica cheia e as demais esmaecidas. */
export function rankedBarOptions(slices: DimensionSlice[], selectedKey: string | undefined): EChartsCoreOption {
  const total = slices.reduce((acc, s) => acc + s.total, 0);
  return {
    ...base(),
    grid: { left: 4, right: 72, top: 4, bottom: 4, containLabel: true },
    tooltip: {
      ...(base()['tooltip'] as object),
      trigger: 'item',
      formatter: (p: any) => {
        const s = slices[p.dataIndex];
        const pct = total > 0 ? ((s.total / total) * 100).toFixed(1) : '0';
        return (
          `<div style="font-weight:600;color:${P.ink}">${escapeHtml(s.label)}</div>` +
          `<div style="margin-top:4px"><strong>${formatBRL(s.total)}</strong> <span style="color:${P.muted}">· ${pct}%</span></div>`
        );
      },
    },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      inverse: true,
      data: slices.map((s) => s.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: P.inkSecondary,
        fontSize: 12,
        width: 130,
        overflow: 'truncate',
      },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 16,
        cursor: 'pointer',
        data: slices.map((s) => {
          const isSelected = selectedKey === s.key;
          const dimmed = selectedKey !== undefined && !isSelected;
          const isOthers = s.key === OTHERS_KEY;
          return {
            value: s.total,
            itemStyle: {
              color: isOthers ? P.ghost : dimmed ? P.brandMuted : P.brand,
              borderRadius: [0, 4, 4, 0],
            },
            label: {
              show: s.total > 0,
              position: 'right',
              color: dimmed || isOthers ? P.muted : P.ink,
              fontWeight: isSelected ? 700 : 600,
              fontSize: 11,
              formatter: () => axisBRL(s.total),
            },
          };
        }),
        emphasis: { itemStyle: { color: P.emphasis } },
      },
    ],
  };
}

export const rankedBarHeight = (count: number) => Math.max(120, count * 30 + 16);

/** Parcelas a vencer nos próximos 12 meses, empilhadas por meio de pagamento. */
export function commitmentsOptions(fc: FutureCommitments): EChartsCoreOption {
  const ordered = [...fc.meiosPagamento].sort((a, b) => a.nome.localeCompare(b.nome));
  // Cor acompanha o meio de pagamento (ordem alfabética estável); a partir do 8º vira "Outros"
  const visible = ordered.slice(0, 7);
  const othersIds = ordered.slice(7).map((m) => m.id);
  const labels = fc.meses.map((m) => {
    const [y, mo] = m.mes.split('-').map(Number);
    return `${monthLabels()[mo - 1]}/${String(y).slice(2)}`;
  });

  const series: any[] = visible.map((meio, idx) => ({
    name: meio.nome,
    type: 'bar',
    stack: 'total',
    barMaxWidth: 28,
    itemStyle: { color: CATEGORICAL[idx], borderColor: P.surface, borderWidth: 1 },
    data: fc.meses.map((m) => m.porMeio[meio.id] ?? 0),
  }));
  if (othersIds.length) {
    series.push({
      name: t('Outros'),
      type: 'bar',
      stack: 'total',
      barMaxWidth: 28,
      itemStyle: { color: P.ghost, borderColor: P.surface, borderWidth: 1 },
      data: fc.meses.map((m) => othersIds.reduce((acc, id) => acc + (m.porMeio[id] ?? 0), 0)),
    });
  }
  // Cantos arredondados só no topo da pilha
  if (series.length) series[series.length - 1].itemStyle.borderRadius = [4, 4, 0, 0];

  return {
    ...base(),
    grid: { left: 8, right: 8, top: 40, bottom: 4, containLabel: true },
    legend: {
      top: 0,
      left: 0,
      type: 'scroll',
      itemWidth: 12,
      itemHeight: 12,
      icon: 'roundRect',
      textStyle: { color: P.inkSecondary, fontSize: 12 },
    },
    tooltip: {
      ...(base()['tooltip'] as object),
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,74,173,0.05)' } },
      formatter: (params: any[]) => {
        const i = params[0].dataIndex;
        const rows = params
          .filter((p) => p.value > 0)
          .map((p) => tooltipRow(p.color, p.seriesName, p.value))
          .join('');
        return `<div style="font-weight:600;color:${P.ink}">${labels[i]} · ${formatBRL(fc.meses[i].total)}</div>${rows}`;
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: P.axis } },
      axisTick: { show: false },
      axisLabel: { color: P.inkSecondary, fontSize: 11 },
    },
    yAxis: valueAxis(),
    series,
  };
}

/** Contas a pagar: pago × pendente por mês (cores de status, sempre com legenda). */
export function billsOptions(contas: BillsMonthSummary[], selected: number | undefined): EChartsCoreOption {
  const dim = (i: number) => selected !== undefined && selected !== i + 1;
  return {
    ...base(),
    grid: { left: 8, right: 8, top: 36, bottom: 4, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      icon: 'roundRect',
      textStyle: { color: P.inkSecondary, fontSize: 12 },
      data: [t('Pago'), t('Pendente')],
    },
    tooltip: {
      ...(base()['tooltip'] as object),
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,74,173,0.05)' } },
      formatter: (params: any[]) => {
        const c = contas[params[0].dataIndex];
        return (
          `<div style="font-weight:600;color:${P.ink}">${monthNames()[c.mes - 1]}</div>` +
          tooltipRow(STATUS_GOOD, t('Pago'), c.pago) +
          tooltipRow(STATUS_WARNING, t('Pendente'), c.pendente)
        );
      },
    },
    xAxis: {
      type: 'category',
      data: monthLabels(),
      axisLine: { lineStyle: { color: P.axis } },
      axisTick: { show: false },
      axisLabel: { color: P.inkSecondary, fontSize: 11 },
    },
    yAxis: valueAxis(),
    series: [
      {
        name: t('Pago'),
        type: 'bar',
        stack: 'contas',
        // Cor na série (legenda) e por barra (esmaecer meses não selecionados)
        itemStyle: { color: STATUS_GOOD },
        barMaxWidth: 22,
        cursor: 'pointer',
        data: contas.map((c, i) => ({
          value: c.pago,
          itemStyle: { color: STATUS_GOOD, opacity: dim(i) ? 0.3 : 1, borderColor: P.surface, borderWidth: 1 },
        })),
      },
      {
        name: t('Pendente'),
        type: 'bar',
        stack: 'contas',
        itemStyle: { color: STATUS_WARNING },
        barMaxWidth: 22,
        cursor: 'pointer',
        data: contas.map((c, i) => ({
          value: c.pendente,
          itemStyle: {
            color: STATUS_WARNING,
            opacity: dim(i) ? 0.3 : 1,
            borderColor: P.surface,
            borderWidth: 1,
            borderRadius: [4, 4, 0, 0],
          },
        })),
      },
    ],
  };
}
