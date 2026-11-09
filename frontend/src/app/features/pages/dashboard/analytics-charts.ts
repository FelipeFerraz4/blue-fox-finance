import type { EChartsCoreOption } from 'echarts/core';
import {
  BillsMonthSummary,
  DimensionSlice,
  FutureCommitments,
} from '../../../shared/model/types/analytics.model';
import { MONTH_LABELS, MONTH_NAMES } from './analytics.store';

// Paleta: uma série = azul da marca; selecionado cheio, demais esmaecidos.
export const BRAND = '#004aad';
export const BRAND_MUTED = '#b9cbe8';
const GHOST = '#d9dee6';
const INK = '#0b132b';
const INK_SECONDARY = '#475569';
const MUTED = '#898781';
const GRID = '#eef0f3';
const AXIS = '#cbd5e1';
const STATUS_GOOD = '#0ca30c';
const STATUS_WARNING = '#fab219';

// Paleta categórica de referência, em ordem fixa (validada para daltonismo,
// vizinhos ΔE >= 9 sobre fundo branco). Usada só quando a cor identifica algo.
export const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];

export const OTHERS_KEY = '__outros__';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const formatBRL = (v: number) => currency.format(v);
const axisBRL = (v: number) => (v === 0 ? '0' : `R$ ${compact.format(v)}`);

/** O tooltip do ECharts renderiza HTML: rótulos vindos do usuário precisam de escape. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

const tooltipRow = (color: string, name: string, value: number) =>
  `<div style="display:flex;align-items:center;gap:8px;margin-top:4px">` +
  `<span style="display:inline-block;width:12px;height:3px;border-radius:2px;background:${color}"></span>` +
  `<strong style="color:${INK}">${formatBRL(value)}</strong>` +
  `<span style="color:${INK_SECONDARY}">${escapeHtml(name)}</span></div>`;

const BASE: EChartsCoreOption = {
  animationDuration: 400,
  animationDurationUpdate: 300,
  textStyle: { fontFamily: 'Inter, -apple-system, "Segoe UI", sans-serif', color: INK_SECONDARY },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: INK, fontSize: 12 },
    extraCssText: 'box-shadow:0 8px 24px rgba(11,19,43,0.12);border-radius:10px;',
  },
};

const valueAxis = {
  type: 'value',
  axisLabel: { color: MUTED, fontSize: 11, formatter: axisBRL },
  splitLine: { lineStyle: { color: GRID, width: 1 } },
  axisLine: { show: false },
  axisTick: { show: false },
};

/** Gastos por mês do ano (barras clicáveis) com o ano anterior em cinza no mesmo eixo. */
export function monthlyChartOptions(
  current: number[],
  previous: number[],
  year: number,
  selected: number | undefined,
): EChartsCoreOption {
  const maxIndex = current.indexOf(Math.max(...current));
  return {
    ...BASE,
    grid: { left: 8, right: 8, top: 36, bottom: 4, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      icon: 'roundRect',
      textStyle: { color: INK_SECONDARY, fontSize: 12 },
      data: [String(year - 1), String(year)],
    },
    tooltip: {
      ...(BASE['tooltip'] as object),
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,74,173,0.05)' } },
      formatter: (params: any[]) => {
        const i = params[0].dataIndex;
        const prev = previous[i] ?? 0;
        const diff = prev > 0 ? ` <span style="color:${MUTED}">(${current[i] >= prev ? '▲' : '▼'} ${Math.abs(((current[i] - prev) / prev) * 100).toFixed(0)}% vs ${year - 1})</span>` : '';
        return (
          `<div style="font-weight:600;color:${INK}">${MONTH_NAMES[i]}${diff}</div>` +
          tooltipRow(BRAND, String(year), current[i]) +
          tooltipRow(GHOST, String(year - 1), prev) +
          `<div style="color:${MUTED};margin-top:6px;font-size:11px">Clique para filtrar este mês</div>`
        );
      },
    },
    xAxis: {
      type: 'category',
      data: MONTH_LABELS,
      axisLine: { lineStyle: { color: AXIS } },
      axisTick: { show: false },
      axisLabel: { color: INK_SECONDARY, fontSize: 12 },
    },
    yAxis: valueAxis,
    series: [
      {
        name: String(year - 1),
        type: 'bar',
        data: previous,
        barGap: '8%',
        barMaxWidth: 22,
        itemStyle: { color: GHOST, borderRadius: [4, 4, 0, 0] },
        emphasis: { disabled: true },
        cursor: 'pointer',
      },
      {
        name: String(year),
        type: 'bar',
        barMaxWidth: 22,
        cursor: 'pointer',
        data: current.map((value, i) => {
          const isSelected = selected === i + 1;
          const dimmed = selected !== undefined && !isSelected;
          // Rótulo direto só no selecionado (ou no maior mês, sem seleção)
          const showLabel = value > 0 && (isSelected || (selected === undefined && i === maxIndex));
          return {
            value,
            itemStyle: { color: dimmed ? BRAND_MUTED : BRAND, borderRadius: [4, 4, 0, 0] },
            label: {
              show: showLabel,
              position: 'top',
              color: INK,
              fontWeight: 600,
              fontSize: 11,
              formatter: () => axisBRL(value),
            },
          };
        }),
        emphasis: { itemStyle: { color: '#003780' } },
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
      label: `Outros (${rest.length})`,
      total: Number(rest.reduce((acc, s) => acc + s.total, 0).toFixed(2)),
      count: rest.reduce((acc, s) => acc + s.count, 0),
    },
  ];
}

/** Barras horizontais ordenadas; a selecionada fica cheia e as demais esmaecidas. */
export function rankedBarOptions(slices: DimensionSlice[], selectedKey: string | undefined): EChartsCoreOption {
  const total = slices.reduce((acc, s) => acc + s.total, 0);
  return {
    ...BASE,
    grid: { left: 4, right: 72, top: 4, bottom: 4, containLabel: true },
    tooltip: {
      ...(BASE['tooltip'] as object),
      trigger: 'item',
      formatter: (p: any) => {
        const s = slices[p.dataIndex];
        const pct = total > 0 ? ((s.total / total) * 100).toFixed(1) : '0';
        const hint = s.key === OTHERS_KEY ? '' : `<div style="color:${MUTED};margin-top:6px;font-size:11px">Clique para filtrar</div>`;
        return (
          `<div style="font-weight:600;color:${INK}">${escapeHtml(s.label)}</div>` +
          `<div style="margin-top:4px"><strong>${formatBRL(s.total)}</strong> <span style="color:${MUTED}">· ${pct}% · ${s.count} item(ns)</span></div>` +
          hint
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
        color: INK_SECONDARY,
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
        data: slices.map((s, i) => {
          const isSelected = selectedKey === s.key;
          const dimmed = selectedKey !== undefined && !isSelected;
          const isOthers = s.key === OTHERS_KEY;
          return {
            value: s.total,
            itemStyle: {
              color: isOthers ? GHOST : dimmed ? BRAND_MUTED : BRAND,
              borderRadius: [0, 4, 4, 0],
            },
            // Rótulo direto só no primeiro e no selecionado; o resto fica no tooltip
            label: {
              show: isSelected || (selectedKey === undefined && i === 0),
              position: 'right',
              color: INK,
              fontWeight: 600,
              fontSize: 11,
              formatter: () => axisBRL(s.total),
            },
          };
        }),
        emphasis: { itemStyle: { color: '#003780' } },
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
    return `${MONTH_LABELS[mo - 1]}/${String(y).slice(2)}`;
  });

  const series: any[] = visible.map((meio, idx) => ({
    name: meio.nome,
    type: 'bar',
    stack: 'total',
    barMaxWidth: 28,
    itemStyle: { color: CATEGORICAL[idx], borderColor: '#ffffff', borderWidth: 1 },
    data: fc.meses.map((m) => m.porMeio[meio.id] ?? 0),
  }));
  if (othersIds.length) {
    series.push({
      name: 'Outros',
      type: 'bar',
      stack: 'total',
      barMaxWidth: 28,
      itemStyle: { color: GHOST, borderColor: '#ffffff', borderWidth: 1 },
      data: fc.meses.map((m) => othersIds.reduce((acc, id) => acc + (m.porMeio[id] ?? 0), 0)),
    });
  }
  // Cantos arredondados só no topo da pilha
  if (series.length) series[series.length - 1].itemStyle.borderRadius = [4, 4, 0, 0];

  return {
    ...BASE,
    grid: { left: 8, right: 8, top: 40, bottom: 4, containLabel: true },
    legend: {
      top: 0,
      left: 0,
      type: 'scroll',
      itemWidth: 12,
      itemHeight: 12,
      icon: 'roundRect',
      textStyle: { color: INK_SECONDARY, fontSize: 12 },
    },
    tooltip: {
      ...(BASE['tooltip'] as object),
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,74,173,0.05)' } },
      formatter: (params: any[]) => {
        const i = params[0].dataIndex;
        const rows = params
          .filter((p) => p.value > 0)
          .map((p) => tooltipRow(p.color, p.seriesName, p.value))
          .join('');
        return `<div style="font-weight:600;color:${INK}">${labels[i]} · ${formatBRL(fc.meses[i].total)}</div>${rows}`;
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: AXIS } },
      axisTick: { show: false },
      axisLabel: { color: INK_SECONDARY, fontSize: 11 },
    },
    yAxis: valueAxis,
    series,
  };
}

/** Contas a pagar: pago × pendente por mês (cores de status, sempre com legenda). */
export function billsOptions(contas: BillsMonthSummary[], selected: number | undefined): EChartsCoreOption {
  const dim = (i: number) => selected !== undefined && selected !== i + 1;
  return {
    ...BASE,
    grid: { left: 8, right: 8, top: 36, bottom: 4, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      icon: 'roundRect',
      textStyle: { color: INK_SECONDARY, fontSize: 12 },
      data: ['✓ Pago', '● Pendente'],
    },
    tooltip: {
      ...(BASE['tooltip'] as object),
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,74,173,0.05)' } },
      formatter: (params: any[]) => {
        const c = contas[params[0].dataIndex];
        const extra = [
          c.quantidadeAtrasada ? `${c.quantidadeAtrasada} atrasada(s)` : '',
          c.semValor ? `${c.semValor} sem valor definido` : '',
        ].filter(Boolean).join(' · ');
        return (
          `<div style="font-weight:600;color:${INK}">${MONTH_NAMES[c.mes - 1]}</div>` +
          tooltipRow(STATUS_GOOD, `Pago (${c.quantidadePaga})`, c.pago) +
          tooltipRow(STATUS_WARNING, `Pendente (${c.quantidadePendente})`, c.pendente) +
          (extra ? `<div style="color:${MUTED};margin-top:6px;font-size:11px">${extra}</div>` : '')
        );
      },
    },
    xAxis: {
      type: 'category',
      data: MONTH_LABELS,
      axisLine: { lineStyle: { color: AXIS } },
      axisTick: { show: false },
      axisLabel: { color: INK_SECONDARY, fontSize: 11 },
    },
    yAxis: valueAxis,
    series: [
      {
        name: '✓ Pago',
        type: 'bar',
        stack: 'contas',
        // Cor na série (legenda) e por barra (esmaecer meses não selecionados)
        itemStyle: { color: STATUS_GOOD },
        barMaxWidth: 22,
        cursor: 'pointer',
        data: contas.map((c, i) => ({
          value: c.pago,
          itemStyle: { color: STATUS_GOOD, opacity: dim(i) ? 0.3 : 1, borderColor: '#ffffff', borderWidth: 1 },
        })),
      },
      {
        name: '● Pendente',
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
            borderColor: '#ffffff',
            borderWidth: 1,
            borderRadius: [4, 4, 0, 0],
          },
        })),
      },
    ],
  };
}
