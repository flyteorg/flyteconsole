import React, { ForwardedRef, UIEventHandler, forwardRef, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import styled from '@mui/system/styled';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { dNode } from '../../../../../models/Graph/types';
import { getNodeExecutionPhaseConstants } from '../../../utils';
import {
  BarItemData,
  formatSecondsToHmsFormat,
  generateChartData,
  getChartData,
  getDuration,
  parseSpanData,
} from './utils';
import { getBarOptions } from './barOptions';
import { NodeExecutionPhase } from '../../../../../models/Execution/enums';
import { useNodeExecutionsById } from '../../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { useScaleContext } from '../ScaleProvider/useScaleContext';

const StyledTimelineChart = styled('div')(() => ({
  flex: 1,
  overflowY: 'hidden',
}));

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  background: theme.palette.grey[100],
  color: theme.palette.common.black,
  padding: theme.spacing(2),
  borderRadius: 8,
  width: 'auto',
  minWidth: 'max-content' /* Ensure it's at least as wide as the longest content */,
  '.phaseText': {
    width: 'fit-content',
    marginBlockEnd: theme.spacing(1),
  },
  '.tooltipText': {
    minWidth: '50px',
  },
  '.tooltipTextContainer': {
    padding: 0,
    display: 'grid',
    gridTemplateColumns: '.66fr 1fr',
    gridAutoFlow: 'column dense',
    gap: 0,
    color: theme.palette.grey[700],
  },
  '.operationIdContainer': {
    textAlign: 'left',
    flex: 1,
  },
  '.tooltipText, .operationIdContainer': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis' /* Adds an ellipsis if the text overflows */,
  },
}));

interface TimelineChartProps {
  chartData: BarItemData[];
  nodes: dNode[];
  chartWidth: number;
  parsedExecutionMetricsData: ReturnType<typeof parseSpanData>;
  onScroll: UIEventHandler<HTMLDivElement>;
}

export const TimelineChart = forwardRef(
  (
    { chartData, nodes, chartWidth, parsedExecutionMetricsData, onScroll }: TimelineChartProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const { chartIntervalSeconds, roundedMaxScaleValueSeconds } = useScaleContext();

    const [tooltip, setTooltip] = useState({
      opacity: 0,
      top: 0,
      left: 0,
      dataIndex: -1,
    });
    const chartRef = useRef<any>(null);
    const phaseData = generateChartData(chartData);
    const { nodeExecutionsById } = useNodeExecutionsById();
    const options = getBarOptions(
      roundedMaxScaleValueSeconds,
      chartIntervalSeconds,
      phaseData.tooltipLabel,
      chartRef,
      tooltip,
      setTooltip,
    ) as any;

    const node = nodes[tooltip.dataIndex];
    const nodeExecution = nodeExecutionsById[node?.scopedId];
    const phase = nodeExecution?.closure.phase ?? NodeExecutionPhase.UNDEFINED;
    const data = getChartData(phaseData);
    const phaseConstant = getNodeExecutionPhaseConstants(phase);
    const spans = parsedExecutionMetricsData[node?.scopedId] || [];

    return (
      <StyledTimelineChart ref={ref} onScroll={onScroll}>
        <Box
          sx={{
            marginTop: '-10px',
            marginLeft: '-10px',
            width: `${chartWidth + 20}px`,
            height: `${56 * nodes.length + 20}px`,
          }}
        >
          <Bar options={options} data={data} ref={chartRef} plugins={[ChartDataLabels]} />

          <StyledBox
            sx={{
              top: tooltip.top + 10,
              left: tooltip.left + 10,
              display: tooltip.opacity ? 'block' : 'none',
            }}
          >
            {phase && <Box className="phaseText">{phaseConstant.text}</Box>}
            {spans?.map((span, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box
                className={`tooltipTextContainer tooltipTextContainer_${index}`}
                key={`${index}_${span.startTime}_${span.endTime}`}
              >
                <Box className="tooltipText">
                  {formatSecondsToHmsFormat(
                    Math.round((getDuration(span?.startTime, span.endTime) / 1000) * 100) / 100,
                  )}
                </Box>
                <Box className="operationIdContainer">{span.operationId}</Box>
              </Box>
            ))}
          </StyledBox>
        </Box>
      </StyledTimelineChart>
    );
  },
);
