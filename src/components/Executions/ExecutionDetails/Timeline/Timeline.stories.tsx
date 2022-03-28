import { ComponentMeta, ComponentStory } from '@storybook/react';
import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { statusColors } from 'components/Theme/constants';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { getNodeExecutionPhaseConstants } from 'components/Executions/utils';
import { generateChartData, getChartData, getOffsetColor } from './BarChart/utils';

ChartJS.register(...registerables, ChartDataLabels);

const mockData = [5, 2, 10, 25, 20];
const startOffset = [0, 10, 0, 15, 7];
const isCachedValue = [false, true, false, false, false];
const backgroundColor = [
  statusColors.FAILURE,
  statusColors.QUEUED,
  statusColors.RUNNING,
  statusColors.WARNING,
  statusColors.SUCCESS,
];

const isFromCache = [false, true, true, false, false, false];
const phaseStatus = [
  NodeExecutionPhase.FAILED,
  NodeExecutionPhase.SUCCEEDED,
  NodeExecutionPhase.SUCCEEDED,
  NodeExecutionPhase.RUNNING,
  NodeExecutionPhase.UNDEFINED,
  NodeExecutionPhase.SUCCEEDED,
];

const barItems = [
  { phase: phaseStatus[0], startOffsetSec: 0, durationSec: 5, isFromCache: isFromCache[0] },
  { phase: phaseStatus[1], startOffsetSec: 10, durationSec: 2, isFromCache: isFromCache[1] },
  { phase: phaseStatus[2], startOffsetSec: 0, durationSec: 1, isFromCache: isFromCache[2] },
  { phase: phaseStatus[3], startOffsetSec: 0, durationSec: 10, isFromCache: isFromCache[3] },
  { phase: phaseStatus[4], startOffsetSec: 15, durationSec: 25, isFromCache: isFromCache[4] },
  { phase: phaseStatus[5], startOffsetSec: 7, durationSec: 20, isFromCache: isFromCache[5] },
];

const chartData = {
  labels: mockData.map(() => ''),
  datasets: [
    {
      data: startOffset,
      backgroundColor: getOffsetColor(isCachedValue),
      barPercentage: 1,
      borderWidth: 0,
      datalabels: {
        labels: {
          title: null,
        },
      },
    },
    {
      data: mockData.map((duration) => {
        return duration === -1 ? 10 : duration === 0 ? 0.5 : duration;
      }),
      backgroundColor: backgroundColor,
      barPercentage: 1,
      borderWidth: 0,
      datalabels: {
        color: '#292936' as const,
        align: 'end' as const,
        anchor: 'start' as const,
        formatter: function (value, context) {
          if (mockData[context.dataIndex] === -1) {
            return '';
          }
          return Math.round(value) + 's';
        },
      },
    },
  ],
};

const getBarOptions = (
  chartTimeInterval: number,
  isFromCache: boolean[],
  phaseStatus: NodeExecutionPhase[],
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
        filter: function (tooltipItem) {
          // no tooltip for offsets
          return tooltipItem.datasetIndex === 1;
        },
        // Setting up tooltip: https://www.chartjs.org/docs/latest/configuration/tooltip.html
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            let label = getNodeExecutionPhaseConstants(phaseStatus[index]).text;
            if (context.parsed.x !== null) {
              label += `: ${context.parsed.x}s`;
            }

            if (isFromCache[index]) {
              return [label, 'Read from cache'];
            }
            return label;
          },
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
          stepSize: chartTimeInterval,
        },
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
};

export default {
  title: 'Workflow/Timeline',
  component: Bar,
} as ComponentMeta<typeof Bar>;

const Template: ComponentStory<typeof Bar> = (args) => <Bar {...args} />;
export const SingleBar = Template.bind({});
SingleBar.args = {
  options: getBarOptions(1, isFromCache, phaseStatus),
  data: getChartData(generateChartData(barItems)),
};

export const BarSection = () => {
  // Chart interval - 1s
  return <Bar options={getBarOptions(1, isFromCache, phaseStatus)} data={chartData} />;
};
