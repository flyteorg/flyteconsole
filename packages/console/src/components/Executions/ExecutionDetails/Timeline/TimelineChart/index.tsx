import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import { dNode } from 'models/Graph/types';
import { Box, Theme, makeStyles } from '@material-ui/core';

import { NodeExecutionPhase } from 'models';
import { getNodeExecutionPhaseConstants } from 'components/Executions/utils';
import {
  BarItemData,
  formatSecondsToHmsFormat,
  generateChartData,
  getChartData,
  getDuration,
  parseSpanData,
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

interface StyleProps {
  opacity: number;
  top: number;
  left: number;
  phaseColor: string;
}

const useStyles = makeStyles<Theme, StyleProps>(theme => ({
  tooltipContainer: {
    position: 'absolute',
    background: theme.palette.grey[100],
    color: theme.palette.common.black,
    padding: theme.spacing(2),
    borderRadius: 2.5,
    width: 'fit-content',
    opacity: ({ opacity }) => opacity,
    top: ({ top }) => top + 10,
    left: ({ left }) => left + 10,
  },
  phaseText: {
    width: 'fit-content',
    padding: theme.spacing(0.75, 1),
    marginInline: 'auto',
    marginBlockEnd: theme.spacing(2),
    backgroundColor: ({ phaseColor }) => phaseColor,
  },
  tooltipText: {
    minWidth: '80px',
    color: theme.palette.grey[700],
  },
  tooltipTextContainer: {
    display: 'flex',
    gap: 1,
  },
  operationIdContainer: {
    textAlign: 'left',
    flex: 1,
  },
}));

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

  const node = props.nodes[tooltip.dataIndex];

  const phase = node?.execution?.closure.phase ?? NodeExecutionPhase.UNDEFINED;
  const phaseConstant = getNodeExecutionPhaseConstants(phase);

  const spans = (node && props.parsedExecutionMetricsData[node.scopedId]) || [];

  const styles = useStyles({
    opacity: tooltip.opacity,
    top: tooltip.top,
    left: tooltip.left,
    phaseColor: phaseConstant.badgeColor,
  });

  return (
    <>
      <Bar options={options} data={data} ref={chartRef} />
      <Box className={styles.tooltipContainer}>
        {phase && <Box className={styles.phaseText}>{phaseConstant.text}</Box>}
        {spans?.map(span => (
          <Box className={styles.tooltipTextContainer}>
            <Box className={styles.tooltipText}>
              {formatSecondsToHmsFormat(
                Math.round(getDuration(span.startTime, span.endTime) / 1000),
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
