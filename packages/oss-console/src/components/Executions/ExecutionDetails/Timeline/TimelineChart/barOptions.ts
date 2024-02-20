import React from 'react';
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
  ChartOptions,
} from 'chart.js';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';

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
ChartJS.register(...registerables);

// Create positioner to put tooltip at cursor position
// The cursor caller is a regession for timeline bar chart
(Tooltip.positioners as { [key: string]: any }).cursor = (
  _chartElements: any,
  coordinates: any,
) => {
  return coordinates;
};

export const getBarOptions = (
  roundedMaxScaleValueSeconds: number,
  chartTimeIntervalSec: number,
  tooltipLabels: string[][],
  chartRef: React.MutableRefObject<any>,
  tooltip: any,
  setTooltip: any,
) => {
  const options: ChartOptions<'bar'> = {
    animation: false as const,
    indexAxis: 'y' as const, // horizontal bar chart
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
        position: 'cursor' as any,
        filter(tooltipItem: any) {
          // no tooltip for offsets
          return tooltipItem.datasetIndex !== 0;
        },
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;

            return tooltipLabels ? [`${tooltipLabels[index]}`] : '';
          },
          labelColor: () => {
            return {
              borderColor: 'white',
              backgroundColor: 'white',
              fontColor: 'white',
            };
          },
        },
        external: (context: any) => {
          const tooltipModel = context.tooltip;

          if (!chartRef || !chartRef.current) {
            return;
          }

          if (tooltipModel.opacity === 0) {
            if (tooltip.opacity !== 0) setTooltip((prev: any) => ({ ...prev, opacity: 0 }));
            return;
          }

          const position = context.chart.canvas.getBoundingClientRect();

          const dataIndex = tooltipModel.dataPoints[0]?.dataIndex;

          if (isNil(dataIndex)) {
            return;
          }

          const newTooltipData = {
            opacity: 1,
            left: position.left + tooltipModel.caretX - 80,
            top: position.top + tooltipModel.caretY - 80,
            dataIndex,
          };

          if (!isEqual(tooltip, newTooltipData)) {
            setTooltip(newTooltipData);
          }
        },
      },
    },
    scales: {
      x: {
        position: 'top' as const,
        type: 'linear' as const,
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: roundedMaxScaleValueSeconds,
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

  return options;
};
