import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import styled from '@mui/system/styled';
import { useQueryClient } from 'react-query';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { useConditionalQuery } from '../../../hooks/useConditionalQuery';
import { makeExecutionMetricsQuery } from '../../../../queries/executionMetricsQuery';
import { ExecutionContext } from '../../contexts';
import { useScaleContext } from './ScaleProvider/useScaleContext';
import { TimelineChart } from './TimelineChart';
import { BarItemData, parseSpanData } from './TimelineChart/utils';
import { dNode } from '../../../../models/Graph/types';
import { ChartHeader } from './ChartHeader';
import { WaitForQuery } from '../../../common/WaitForQuery';
import { WorkflowExecutionGetMetricsResponse } from '../../../../models/Execution/types';

const StyledTaskDurations = styled('div')(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.divider}`,
  marginLeft: 4,
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const INTERVAL_LENGTH = 110;

interface ExecutionTimelineChartProps {
  chartTimezone: string;
  totalDurationSec: number;
  showNodes: dNode[];
  startedAt: Date;
  barItemsData: BarItemData[];
}

export const ExecutionTimelineChartInner = forwardRef<
  HTMLDivElement,
  ExecutionTimelineChartProps & {
    executionMetricsData: WorkflowExecutionGetMetricsResponse;
  }
>(
  (
    { chartTimezone, startedAt, showNodes, totalDurationSec, barItemsData, executionMetricsData },
    durationsRef,
  ) => {
    const { chartIntervalSeconds, roundedMaxScaleValueSeconds } = useScaleContext();

    const [chartWidth, setChartWidth] = useState(0);
    const [labelInterval, setLabelInterval] = useState(INTERVAL_LENGTH);
    const durationsLabelsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Sync width of elements and intervals of ChartHeader (time labels) and TimelineChart
      const calcWidth =
        Math.ceil(roundedMaxScaleValueSeconds / chartIntervalSeconds) * INTERVAL_LENGTH;
      const clientWidth =
        (durationsRef as React.RefObject<HTMLDivElement>)?.current?.clientWidth ?? 0;

      if (clientWidth && calcWidth < clientWidth) {
        const interval =
          clientWidth / Math.ceil(roundedMaxScaleValueSeconds / chartIntervalSeconds);
        setLabelInterval(interval);
        setChartWidth(clientWidth);
      } else {
        setChartWidth(calcWidth);
        setLabelInterval(INTERVAL_LENGTH);
      }
    }, [totalDurationSec, chartIntervalSeconds, roundedMaxScaleValueSeconds, durationsRef]);

    const onHorizontalGraphScroll = () => {
      // cover horizontal scroll only
      const scrollLeft =
        (durationsRef as React.RefObject<HTMLDivElement>)?.current?.scrollLeft ?? 0;
      const labelView = durationsLabelsRef?.current;
      if (labelView) {
        labelView.scrollTo({
          left: scrollLeft,
        });
      }
    };

    const parsedExecutionMetricsData = parseSpanData(executionMetricsData);

    return (
      <StyledTaskDurations>
        <ChartHeader
          ref={durationsLabelsRef}
          startedAt={startedAt}
          chartWidth={chartWidth}
          labelInterval={labelInterval}
          chartTimezone={chartTimezone}
        />
        <TimelineChart
          nodes={showNodes}
          chartData={barItemsData}
          chartWidth={chartWidth}
          parsedExecutionMetricsData={parsedExecutionMetricsData}
          onScroll={onHorizontalGraphScroll}
          ref={durationsRef}
        />
      </StyledTaskDurations>
    );
  },
);

export const ExecutionTimelineChart = forwardRef<HTMLDivElement, ExecutionTimelineChartProps>(
  ({ chartTimezone, startedAt, showNodes, totalDurationSec, barItemsData }, durationsRef) => {
    const queryClient = useQueryClient();
    const { execution } = useContext(ExecutionContext);
    const executionMetricsQuery = useConditionalQuery(
      {
        ...makeExecutionMetricsQuery(queryClient, execution.id, {
          params: {
            depth: 10,
          },
        }),
        enabled: !!execution.id,
      },
      (prev) => !!prev,
    );

    return (
      <WaitForQuery
        query={executionMetricsQuery}
        loadingComponent={() => <LargeLoadingComponent useDelay={false} />}
      >
        {(executionMetricsData) => {
          return (
            <ExecutionTimelineChartInner
              barItemsData={barItemsData}
              chartTimezone={chartTimezone}
              executionMetricsData={executionMetricsData}
              showNodes={showNodes}
              startedAt={startedAt}
              totalDurationSec={totalDurationSec}
              ref={durationsRef}
            />
          );
        }}
      </WaitForQuery>
    );
  },
);
