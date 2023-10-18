import {
  Chart as ChartJS,
  // registerables
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { isEqual, isNil } from 'lodash';

const registerables = [
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
];

// "registerables" helper was failing tests
registerables.forEach(plugin => ChartJS.register(plugin));
ChartJS.register(ChartDataLabels);

// Create positioner to put tooltip at cursor position
Tooltip.positioners.cursor = function (_chartElements, coordinates) {
  return coordinates;
};

export const getBarOptions = (
  chartTimeIntervalSec: number,
  tooltipLabels: string[][],
  chartRef: React.MutableRefObject<any>,
  tooltip: any,
  setTooltip: any,
) => {
  return {
    animation: false as const,
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        // Setting up tooltip: https://www.chartjs.org/docs/latest/configuration/tooltip.html
        enabled: false,
        position: 'cursor',
        filter: function (tooltipItem) {
          // no tooltip for offsets
          return tooltipItem.datasetIndex !== 0;
        },
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;

            return tooltipLabels ? [`${tooltipLabels[index]}`] : '';
          },
          labelColor: function () {
            return {
              fontColor: 'white',
            };
          },
        },
        external: context => {
          const tooltipModel = context.tooltip;

          if (!chartRef || !chartRef.current) {
            return;
          }

          if (tooltipModel.opacity === 0) {
            if (tooltip.opacity !== 0)
              setTooltip(prev => ({ ...prev, opacity: 0 }));
            return;
          }

          const position = context.chart.canvas.getBoundingClientRect();

          const dataIndex = tooltipModel.dataPoints[0]?.dataIndex;

          if (isNil(dataIndex)) {
            return;
          }

          const newTooltipData = {
            opacity: 1,
            left: position.left + tooltipModel.caretX,
            top: position.top + tooltipModel.caretY,
            dataIndex: dataIndex,
          };

          if (!isEqual(tooltip, newTooltipData)) {
            setTooltip(newTooltipData);
          }
        },
      },
    },
    scales: {
      x: {
        format: Intl.DateTimeFormat,
        position: 'top' as const,
        ticks: {
          display: false,
          autoSkip: false,
          stepSize: chartTimeIntervalSec,
        },
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
};
