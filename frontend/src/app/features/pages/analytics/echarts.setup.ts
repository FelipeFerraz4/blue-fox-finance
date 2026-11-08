// Registro modular do ECharts: só o que a página de Análises usa. Importado apenas
// pela rota lazy de Análises, então a biblioteca não entra no bundle inicial.
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export { echarts };
