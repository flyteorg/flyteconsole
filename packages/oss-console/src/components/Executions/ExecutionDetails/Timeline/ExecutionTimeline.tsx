import React, { createRef, useContext, useMemo, useRef, useState } from 'react';
import styled from '@mui/system/styled';
import { ExecutionTimelineFooter } from './ExecutionTimelineFooter';
import { TimeZone, convertToPlainNodes } from './helpers';
import { getChartDurationData } from './TimelineChart/chartData';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { timestampToDate } from '../../../../common/utils';
import { ScaleProvider } from './ScaleProvider';
import { ExecutionTimelineTable } from './ExecutionTimelineTable';
import { ExecutionTimelineChart } from './ExecutionTimelineChart';
import { ExecutionContext } from '../../contexts';

const StyledExecutionTimeline = styled('div')(() => ({
  display: 'flex',
  flex: '1 1 0',
  overflowY: 'auto',
}));

const StyledExecutionTimelineContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 100%',
}));

export const ExecutionTimeline: React.FC<{}> = () => {
  const { execution } = useContext(ExecutionContext);
  const { nodeExecutionsById, visibleNodes } = useNodeExecutionsById();

  const [chartTimezone, setChartTimezone] = useState(TimeZone.Local);
  const handleTimezoneChange = (tz: string) => setChartTimezone(tz);

  const durationsRef = useRef<HTMLDivElement>(null);
  const taskNamesRef = createRef<HTMLDivElement>();

  const { shownNodes, barItemsData, startedAt, totalDurationSec } = useMemo(() => {
    const plainNodes = convertToPlainNodes(visibleNodes) || [];
    const shownNodes = plainNodes.map((node) => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure?.startedAt,
      };
    });
    const startedAt = timestampToDate(execution?.closure?.startedAt);
    const { items: barItemsData, totalDurationSec } = getChartDurationData(
      shownNodes,
      startedAt!,
      nodeExecutionsById,
    );

    return {
      shownNodes,
      barItemsData,
      startedAt,
      totalDurationSec,
    };
  }, [visibleNodes, nodeExecutionsById, execution]);

  const onVerticalNodesScroll = () => {
    const scrollTop = taskNamesRef?.current?.scrollTop ?? 0;
    const graphView = durationsRef?.current;
    if (graphView) {
      graphView.scrollTo({
        top: scrollTop,
      });
    }
  };

  return (
    <ScaleProvider maxScaleValueSeconds={totalDurationSec}>
      <StyledExecutionTimelineContainer>
        <StyledExecutionTimeline>
          <ExecutionTimelineTable
            showNodes={shownNodes}
            onVerticalNodesScroll={onVerticalNodesScroll}
            ref={taskNamesRef}
          />

          <ExecutionTimelineChart
            barItemsData={barItemsData}
            chartTimezone={chartTimezone}
            showNodes={shownNodes}
            startedAt={startedAt}
            totalDurationSec={totalDurationSec}
            ref={durationsRef}
          />
        </StyledExecutionTimeline>
        <ExecutionTimelineFooter timezone={chartTimezone} onTimezoneChange={handleTimezoneChange} />
      </StyledExecutionTimelineContainer>
    </ScaleProvider>
  );
};
