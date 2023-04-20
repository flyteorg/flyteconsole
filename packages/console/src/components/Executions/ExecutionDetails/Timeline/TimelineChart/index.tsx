import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import { getBarOptions } from './barOptions';
import { BarItemData, generateChartData, getChartData } from './utils';

interface TimelineChartProps {
  items: BarItemData[];
  chartTimeIntervalSec: number;
}

export const TimelineChart = (props: TimelineChartProps) => {
  const phaseData = generateChartData(props.items);

  const options = getBarOptions(
    props.chartTimeIntervalSec,
    phaseData.tooltipLabel,
  ) as any;

  const data = getChartData(phaseData);

  return <Bar options={options} data={data} />;
};
