import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import { dNode } from 'models/Graph/types';
import { Box, makeStyles } from '@material-ui/core';

import { NodeExecutionPhase } from 'models';
import { getNodeExecutionPhaseConstants } from 'components/Executions/utils';
import {
  BarItemData,
  generateChartData,
  getChartData,
  getDuration,
  parseSpanData,
  secondsToHumanReadableDuration,
} from './utils';
import { getBarOptions } from './barOptions';

interface TimelineChartProps {
  items: BarItemData[];
  nodes: dNode[];
  chartTimeIntervalSec: number;
  executionMetricsData: Record<string, number[]>;
  operationIds: string[];
  executionMetricsTooltips: string[][];
  parsedExecutionMetricsData: ReturnType<typeof parseSpanData>;
}

const useStyles = makeStyles({
  tooltipText: {
    width: '100px',
    fontWeight: 'bold',
  },
  tooltipTextContainer: {
    display: 'flex',
    gap: 1,
  },
  operationIdContainer: {
    flex: 1,
  },
});

export const TimelineChart = (props: TimelineChartProps) => {
  const [tooltip, setTooltip] = React.useState({
    opacity: 0,
    top: 0,
    left: 0,
    dataIndex: -1,
  });
  const chartRef = React.useRef<any>(null);
  const phaseData = generateChartData(props.items);
  const styles = useStyles();

  const options = getBarOptions(
    props.chartTimeIntervalSec,
    phaseData.tooltipLabel,
    props.executionMetricsTooltips,
    chartRef,
    tooltip,
    setTooltip,
  ) as any;

  const data = getChartData(phaseData, props.executionMetricsData);

  const node = props.nodes[tooltip.dataIndex];

  const phase = node?.execution?.closure.phase ?? NodeExecutionPhase.UNDEFINED;
  const phaseConstant = getNodeExecutionPhaseConstants(phase);

  const spans = (node && props.parsedExecutionMetricsData[node.scopedId]) || [];

  return (
    <>
      <Bar options={options} data={data} ref={chartRef} />
      <Box
        style={{
          position: 'absolute',
          background: '#eeeeee',
          color: 'black',
          padding: '10px 20px',
          borderRadius: 8,
          width: '250px',
          opacity: tooltip.opacity,
          top: tooltip.top + 10,
          left: tooltip.left + 10,
        }}
      >
        {phase && (
          <Box
            style={{
              padding: '2px 5px',
              textAlign: 'center',
              marginBlockEnd: '10px',
              backgroundColor: phaseConstant.badgeColor,
            }}
          >
            {phaseConstant.text}
          </Box>
        )}
        {spans?.map(span => (
          <Box className={styles.tooltipTextContainer}>
            <Box className={styles.tooltipText}>
              {secondsToHumanReadableDuration(
                getDuration(span.startTime, span.endTime) / 1000,
              )}
            </Box>
            <Box className={styles.operationIdContainer}>
              {span.operationId}
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};
