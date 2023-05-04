import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import { dNode } from 'models/Graph/types';
import { getBarOptions } from './barOptions';
import {
  BarItemData,
  generateChartData,
  getChartData,
  getDuration,
  parseSpanData,
} from './utils';

interface TimelineChartProps {
  items: BarItemData[];
  nodes: dNode[];
  chartTimeIntervalSec: number;
  executionMetricsData: Record<string, number[]>;
  operationIds: string[];
  executionMetricsTooltips: string[][];
  parsedExecutionMetricsData: ReturnType<typeof parseSpanData>;
}

export const TimelineChart = (props: TimelineChartProps) => {
  const [tooltip, setTooltip] = React.useState({
    opacity: 0,
    top: 0,
    left: 0,
    dataIndex: -1,
  });
  const chartRef = React.useRef<any>(null);
  const phaseData = generateChartData(props.items);

  const options = getBarOptions(
    props.chartTimeIntervalSec,
    phaseData.tooltipLabel,
    props.executionMetricsTooltips,
    chartRef,
    tooltip,
    setTooltip,
  ) as any;

  const data = getChartData(phaseData, props.executionMetricsData);

  return (
    <>
      <Bar options={options} data={data} ref={chartRef} />
      <div
        style={{
          opacity: tooltip.opacity,
          position: 'absolute',
          top: tooltip.top + 10,
          left: tooltip.left + 10,
          background: 'rgba(215, 215, 255, 0.8)',
          color: 'black',
          padding: '10px 20px',
        }}
      >
        Hello there
        {props.nodes[tooltip.dataIndex] &&
          props.parsedExecutionMetricsData[
            props.nodes[tooltip.dataIndex].id
          ]?.map(span => (
            <div>
              {span.operationId}:{' '}
              {getDuration(span.startTime, span.endTime) / 1000}
            </div>
          ))}
      </div>
    </>
  );
};
