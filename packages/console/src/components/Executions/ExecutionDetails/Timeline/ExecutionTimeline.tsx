import React, {
  createRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { tableHeaderColor } from 'components/Theme/constants';
import { timestampToDate } from 'common/utils';
import { dNode } from 'models/Graph/types';
import {
  fetchChildrenExecutions,
  searchNode,
} from 'components/Executions/utils';
import { useQueryClient } from 'react-query';
import { eq, merge } from 'lodash';
import { useNodeExecutionsById } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { ExecutionContext } from 'components/Executions/contexts';
import { useExecutionMetrics } from 'components/Executions/useExecutionMetrics';
import { convertToPlainNodes } from './helpers';
import { ChartHeader } from './ChartHeader';
import { useScaleContext } from './scaleContext';
import { TaskNames } from './TaskNames';
import { getChartDurationData } from './TimelineChart/chartData';
import { TimelineChart } from './TimelineChart';
import t from '../strings';
import {
  getExecutionMetricsData,
  getExecutionMetricsTooltips,
  getOperationsFromWorkflowExecutionMetrics,
  parseSpanData,
} from './TimelineChart/utils';

interface StyleProps {
  chartWidth: number;
  itemsShown: number;
}

const useStyles = makeStyles(theme => ({
  chartHeader: (props: StyleProps) => ({
    marginTop: -10,
    marginLeft: -15,
    width: `${props.chartWidth + 20}px`,
    height: `${56 * props.itemsShown + 20}px`,
  }),
  taskNames: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: 'auto',
  },
  taskNamesHeader: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: '16px',
    color: tableHeaderColor,
    height: 45,
    flexBasis: 45,
    display: 'flex',
    alignItems: 'center',
    borderBottom: `4px solid ${theme.palette.divider}`,
    paddingLeft: 30,
  },
  taskDurations: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    marginLeft: 4,
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  taskDurationsLabelsView: {
    overflow: 'hidden',
    borderBottom: `4px solid ${theme.palette.divider}`,
  },
  taskDurationsView: {
    flex: 1,
    overflowY: 'hidden',
  },
}));

const INTERVAL_LENGTH = 110;

interface ExProps {
  chartTimezone: string;
  initialNodes: dNode[];
}

export const ExecutionTimeline: React.FC<ExProps> = ({
  chartTimezone,
  initialNodes,
}) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [labelInterval, setLabelInterval] = useState(INTERVAL_LENGTH);
  const durationsRef = useRef<HTMLDivElement>(null);
  const durationsLabelsRef = useRef<HTMLDivElement>(null);
  const taskNamesRef = createRef<HTMLDivElement>();

  const [originalNodes, setOriginalNodes] = useState<dNode[]>(initialNodes);
  const [showNodes, setShowNodes] = useState<dNode[]>([]);
  const [startedAt, setStartedAt] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const { nodeExecutionsById, setCurrentNodeExecutionsById } =
    useNodeExecutionsById();
  const { chartInterval: chartTimeInterval } = useScaleContext();
  const { execution } = useContext(ExecutionContext);
  const executionMetricsData = useExecutionMetrics(execution.id, 10);

  useEffect(() => {
    setOriginalNodes(ogn => {
      const newNodes = merge(initialNodes, ogn);

      if (!eq(newNodes, ogn)) {
        return newNodes;
      }

      return ogn;
    });

    const plainNodes = convertToPlainNodes(originalNodes);
    const updatedShownNodesMap = plainNodes.map(node => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure.startedAt,
        execution,
      };
    });
    setShowNodes(updatedShownNodesMap);

    // set startTime for all timeline offset and duration calculations.
    const firstStartedAt = updatedShownNodesMap[0]?.startedAt;
    if (firstStartedAt) {
      setStartedAt(timestampToDate(firstStartedAt));
    }
  }, [initialNodes, originalNodes, nodeExecutionsById]);

  const { items: barItemsData, totalDurationSec } = getChartDurationData(
    showNodes,
    startedAt,
  );
  const styles = useStyles({
    chartWidth: chartWidth,
    itemsShown: showNodes.length,
  });

  useEffect(() => {
    // Sync width of elements and intervals of ChartHeader (time labels) and TimelineChart
    const calcWidth =
      Math.ceil(totalDurationSec / chartTimeInterval) * INTERVAL_LENGTH;
    if (durationsRef.current && calcWidth < durationsRef.current.clientWidth) {
      setLabelInterval(
        durationsRef.current.clientWidth /
          Math.ceil(totalDurationSec / chartTimeInterval),
      );
      setChartWidth(durationsRef.current.clientWidth);
    } else {
      setChartWidth(calcWidth);
      setLabelInterval(INTERVAL_LENGTH);
    }
  }, [totalDurationSec, chartTimeInterval, durationsRef]);

  const onGraphScroll = () => {
    // cover horizontal scroll only
    const scrollLeft = durationsRef?.current?.scrollLeft ?? 0;
    const labelView = durationsLabelsRef?.current;
    if (labelView) {
      labelView.scrollTo({
        left: scrollLeft,
      });
    }
  };

  const onVerticalNodesScroll = () => {
    const scrollTop = taskNamesRef?.current?.scrollTop ?? 0;
    const graphView = durationsRef?.current;
    if (graphView) {
      graphView.scrollTo({
        top: scrollTop,
      });
    }
  };

  const toggleNode = async (id: string, scopedId: string, level: number) => {
    await fetchChildrenExecutions(
      queryClient,
      scopedId,
      nodeExecutionsById,
      setCurrentNodeExecutionsById,
    );
    searchNode(originalNodes, 0, id, scopedId, level);
    setOriginalNodes([...originalNodes]);
  };

  const { operations, operationIds } = getExecutionMetricsData(
    executionMetricsData.value,
    showNodes,
  );

  const executionMetricsTooltips = getExecutionMetricsTooltips(
    showNodes,
    operationIds,
    operations,
  );

  const parsedExecutionMetricsData = parseSpanData(executionMetricsData.value);

  return (
    <>
      <div className={styles.taskNames}>
        <Typography className={styles.taskNamesHeader}>
          {t('taskNameColumnHeader')}
        </Typography>
        <TaskNames
          nodes={showNodes}
          ref={taskNamesRef}
          onToggle={toggleNode}
          onScroll={onVerticalNodesScroll}
        />
      </div>
      <div className={styles.taskDurations}>
        <div
          className={styles.taskDurationsLabelsView}
          ref={durationsLabelsRef}
        >
          <ChartHeader
            startedAt={startedAt}
            chartWidth={chartWidth}
            labelInterval={labelInterval}
            chartTimezone={chartTimezone}
            totalDurationSec={totalDurationSec}
          />
        </div>
        <div
          className={styles.taskDurationsView}
          ref={durationsRef}
          onScroll={onGraphScroll}
        >
          <div className={styles.chartHeader}>
            <TimelineChart
              items={barItemsData}
              chartTimeIntervalSec={chartTimeInterval}
              operationIds={operationIds}
              executionMetricsData={operations}
              executionMetricsTooltips={executionMetricsTooltips}
              parsedExecutionMetricsData={parsedExecutionMetricsData}
              nodes={showNodes}
            />
          </div>
        </div>
      </div>
    </>
  );
};
