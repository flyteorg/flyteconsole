import * as React from 'react';
import * as moment from 'moment-timezone';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { tableHeaderColor } from 'components/Theme/constants';
import { Identifier } from 'models/Common/types';
import { NodeExecution, NodeExecutionIdentifier } from 'models/Execution/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { NodeExecutionsTimelineContext } from './context';
import { DetailsPanel } from 'components/common/DetailsPanel';
import { COLOR_SPECTRUM } from 'components/Theme/colorSpectrum';
import { durationToMilliseconds, timestampToDate } from 'common/utils';
import { NodeExecutionDetailsPanelContent } from '../NodeExecutionDetailsPanelContent';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ExecutionTimelineFooter } from './ExecutionTimelineFooter';
import { TimeZone } from './constant';
import { makeWorkflowQuery } from 'components/Workflow/workflowQueries';
import { Workflow, WorkflowClosure } from 'models/Workflow/types';
import { useQuery, useQueryClient } from 'react-query';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { DataError } from 'components/Errors/DataError';
import { dNode } from 'models/Graph/types';
import { transformerWorkflowToPlainNodes } from 'components/WorkflowGraph/transformerWorkflowToDag';
import { isEndNode, isStartNode, isExpanded, getNodeTemplateName } from 'components/WorkflowGraph/utils';
import { RowExpander } from '../../Tables/RowExpander';
import { nodeExecutionPhaseToColor } from 'components/Executions/utils';

// Register components to be usable by chart.js
ChartJS.register(...registerables, ChartDataLabels);

interface Props {
  nodeExecutions: NodeExecution[];
  workflowId: Identifier;
}

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 100%'
  },
  container: {
    display: 'flex',
    flex: '1 1 0',
    overflowY: 'auto'
  },
  taskNames: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: 'auto'
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
    paddingLeft: 30
  },
  taskNamesList: {
    overflowY: 'scroll',
    flex: 1
  },
  taskDurations: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    marginLeft: 4,
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  taskDurationsLabelsView: {
    overflow: 'hidden',
    borderBottom: `4px solid ${theme.palette.divider}`
  },
  taskDurationsLabelItem: {
    fontSize: 12,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    color: COLOR_SPECTRUM.gray40.color,
    paddingLeft: 10
  },
  taskDurationsView: {
    flex: 1,
    overflowY: 'hidden'
  },
  namesContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'left',
    padding: '0 10px',
    height: 56,
    width: 256,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap'
  },
  namesContainerExpander: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto'
  },
  namesContainerBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    height: '100%',
    overflow: 'hidden'
  },
  displayName: {
    marginTop: 4,
    textOverflow: 'ellipsis',
    width: '100%',
    overflow: 'hidden'
  },
  leaf: {
    width: 30
  }
}));

interface TaskNamesProps {
  executions: NodeExecution[];
  nodes: dNode[];
  onToggle: (id: string, scopeId: string) => void;
}

const TaskNames = React.forwardRef<HTMLDivElement, TaskNamesProps>((props, ref) => {
  const { nodes, onToggle } = props;
  const styles = useStyles();

  return (
    <div className={styles.taskNamesList} ref={ref}>
      {nodes.map(node => {
        const templateName = getNodeTemplateName(node);
        return (
          <div
            className={styles.namesContainer}
            key={`task-name-${node.scopedId}`}
            style={{ paddingLeft: (node?.level || 0) * 16 }}
          >
            <div className={styles.namesContainerExpander}>
              {node.nodes?.length ? (
                <RowExpander expanded={node.expanded || false} onClick={() => onToggle(node.id, node.scopedId)} />
              ) : (
                <div className={styles.leaf} />
              )}
            </div>

            <div className={styles.namesContainerBody}>
              {node.name}
              <Typography variant="subtitle1" color="textSecondary" className={styles.displayName}>
                {templateName}
              </Typography>
            </div>
          </div>
        );
      })}
    </div>
  );
});

const INTERVAL_LENGTH = 110;

const ExecutionTimeline: React.FC<Props> = ({ nodeExecutions, workflowId }) => {
  const workflowQuery = useQuery<Workflow, Error>(makeWorkflowQuery(useQueryClient(), workflowId));

  return (
    <WaitForQuery query={workflowQuery} errorComponent={DataError}>
      {props => (
        <ExecutionTimelineWithNodes closure={props.closure!} nodeExecutions={nodeExecutions} workflowId={workflowId} />
      )}
    </WaitForQuery>
  );
};

function convertToPlainNodes(nodes: dNode[], level = 0): dNode[] {
  const result: dNode[] = [];
  if (!nodes || nodes.length === 0) {
    return result;
  }
  nodes.forEach(node => {
    if (isStartNode(node) || isEndNode(node)) {
      return;
    }
    result.push({ ...node, level });
    if (node.nodes.length > 0 && isExpanded(node)) {
      result.push(...convertToPlainNodes(node.nodes, level + 1));
    }
  });
  return result;
}

export const ExecutionTimelineWithNodes: React.FC<Props & {
  closure: WorkflowClosure;
}> = ({ nodeExecutions, closure }) => {
  const styles = useStyles();
  const [selectedExecution, setSelectedExecution] = React.useState<NodeExecutionIdentifier | null>(null);
  const [chartTimeInterval, setChartTimeInterval] = React.useState(12);
  const [chartTimezone, setChartTimezone] = React.useState(TimeZone.Local);
  const [chartWidth, setChartWidth] = React.useState(0);
  const [labelInterval, setLabelInterval] = React.useState(INTERVAL_LENGTH);
  const durationsRef = React.useRef<HTMLDivElement>(null);
  const durationsLabelsRef = React.useRef<HTMLDivElement>(null);
  const taskNamesRef = React.createRef<HTMLDivElement>();

  const [originalNodes, setOriginalNodes] = React.useState<dNode[]>([]);

  React.useEffect(() => {
    const { nodes: originalNodes } = transformerWorkflowToPlainNodes(closure.compiledWorkflow!);
    setOriginalNodes(
      originalNodes.map(node => {
        const index = nodeExecutions.findIndex(exe => exe.id.nodeId === node.id && exe.scopedId === node.scopedId);
        return {
          ...node,
          execution: index >= 0 ? nodeExecutions[index] : undefined
        };
      })
    );
  }, [closure.compiledWorkflow]);

  const nodes = convertToPlainNodes(originalNodes);

  const timelineContext = React.useMemo(() => ({ selectedExecution, setSelectedExecution }), [
    selectedExecution,
    setSelectedExecution
  ]);

  const onCloseDetailsPanel = () => setSelectedExecution(null);
  const handleTimeIntervalChange = interval => setChartTimeInterval(interval);
  const handleTimezoneChange = tz => setChartTimezone(tz);

  // Divide by 1000 to calculate all duration data be second based.
  const durationData = React.useMemo(() => {
    const definedExecutions = nodes.map(node => {
      const exec = node.execution;
      if (!exec) return 0;
      if (exec.closure.phase === NodeExecutionPhase.RUNNING) {
        if (!exec.closure.startedAt) {
          return 0;
        }
        return (Date.now() - timestampToDate(exec.closure.startedAt).getTime()) / 1000;
      }
      if (!exec.closure.duration) {
        return 0;
      }
      return durationToMilliseconds(exec.closure.duration) / 1000;
    });
    return definedExecutions;
  }, [nodes]);

  const colorData = React.useMemo(() => {
    const definedExecutions = nodes.map(({ execution }) =>
      nodeExecutionPhaseToColor(execution?.closure.phase ?? NodeExecutionPhase.UNDEFINED)
    );
    return definedExecutions;
  }, [nodes]);

  const startedAt = React.useMemo(() => {
    if (nodes.length === 0 || !nodes[0].execution?.closure.startedAt) {
      return new Date();
    }
    return timestampToDate(nodes[0].execution?.closure.startedAt);
  }, [nodes]);

  const stackedData = React.useMemo(() => {
    let undefinedStart = 0;
    for (const node of nodes) {
      const exec = node.execution;
      if (exec?.closure.startedAt) {
        const startedTime = timestampToDate(exec?.closure.startedAt).getTime();
        const absoluteDuration =
          startedTime -
          startedAt.getTime() +
          (exec?.closure.duration ? durationToMilliseconds(exec?.closure.duration) : Date.now() - startedTime);
        if (absoluteDuration > undefinedStart) {
          undefinedStart = absoluteDuration;
        }
      }
    }
    undefinedStart = undefinedStart / 1000;

    const definedExecutions = nodes.map(({ execution }) =>
      execution?.closure.startedAt
        ? (timestampToDate(execution?.closure.startedAt).getTime() - startedAt.getTime()) / 1000
        : 0
    );

    return definedExecutions;
  }, [nodes, startedAt]);

  const stackedColorData = React.useMemo(() => {
    return durationData.map(duration => {
      return duration === 0 ? '#4AE3AE40' : 'rgba(0, 0, 0, 0)';
    });
  }, [durationData]);

  const chartData = React.useMemo(() => {
    return {
      labels: durationData.map(() => ''),
      datasets: [
        {
          data: stackedData,
          backgroundColor: stackedColorData,
          barPercentage: 1,
          borderWidth: 0,
          datalabels: {
            labels: {
              title: null
            }
          }
        },
        {
          data: durationData.map(duration => {
            return duration === -1 ? 10 : duration === 0 ? 0.5 : duration;
          }),
          backgroundColor: colorData,
          barPercentage: 1,
          borderWidth: 0,
          datalabels: {
            color: '#292936' as const,
            align: 'start' as const,
            formatter: function(value, context) {
              if (durationData[context.dataIndex] === -1) {
                return '';
              }
              return Math.round(value) + 's';
            }
          }
        }
      ]
    };
  }, [durationData, stackedData, colorData, stackedColorData]);

  const totalDuration = React.useMemo(() => {
    const durations = durationData.map((duration, idx) => duration + stackedData[idx]);
    return Math.max(...durations);
  }, [durationData, stackedData]);

  React.useEffect(() => {
    const calcWidth = Math.ceil(totalDuration / chartTimeInterval) * INTERVAL_LENGTH;
    if (!durationsRef.current) {
      setChartWidth(calcWidth);
      setLabelInterval(INTERVAL_LENGTH);
    } else if (calcWidth < durationsRef.current.clientWidth) {
      setLabelInterval(durationsRef.current.clientWidth / Math.ceil(totalDuration / chartTimeInterval));
      setChartWidth(durationsRef.current.clientWidth);
    } else {
      setChartWidth(calcWidth);
      setLabelInterval(INTERVAL_LENGTH);
    }
  }, [totalDuration, chartTimeInterval, durationsRef]);

  React.useEffect(() => {
    const durationsView = durationsRef?.current;
    const labelsView = durationsLabelsRef?.current;
    if (durationsView && labelsView) {
      const handleScroll = e => {
        durationsView.scrollTo({
          left: durationsView.scrollLeft + e.deltaY,
          behavior: 'smooth'
        });
        labelsView.scrollTo({
          left: labelsView.scrollLeft + e.deltaY,
          behavior: 'smooth'
        });
      };

      durationsView.addEventListener('wheel', handleScroll);

      return () => durationsView.removeEventListener('wheel', handleScroll);
    }

    return () => {};
  }, [durationsRef, durationsLabelsRef]);

  React.useEffect(() => {
    const el = taskNamesRef.current;
    if (el) {
      const handleScroll = e => {
        const canvasView = durationsRef?.current;
        if (canvasView) {
          canvasView.scrollTo({
            top: e.srcElement.scrollTop
            // behavior: 'smooth'
          });
        }
      };

      el.addEventListener('scroll', handleScroll);

      return () => el.removeEventListener('scroll', handleScroll);
    }

    return () => {};
  }, [taskNamesRef, durationsRef]);

  const labels = React.useMemo(() => {
    const len = Math.ceil(totalDuration / chartTimeInterval);
    const lbs = len > 0 ? new Array(len).fill(0) : [];
    return lbs.map((_, idx) => {
      const time = moment.utc(new Date(startedAt.getTime() + idx * chartTimeInterval * 1000));
      return chartTimezone === TimeZone.UTC ? time.format('hh:mm:ss A') : time.local().format('hh:mm:ss A');
    });
  }, [chartTimezone, startedAt, chartTimeInterval, totalDuration]);

  const options = {
    animation: false as const,
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        filter: function(tooltipItem) {
          return tooltipItem.datasetIndex === 1;
        }
      }
    },
    scales: {
      x: {
        format: Intl.DateTimeFormat,
        position: 'top' as const,
        ticks: {
          display: false,
          autoSkip: false,
          stepSize: chartTimeInterval
        },
        stacked: true
      },
      y: {
        stacked: true
      }
    }
  };

  const toggleNode = (id: string, scopeId: string) => {
    const searchNode = (nodes: dNode[]) => {
      if (!nodes || nodes.length === 0) {
        return;
      }
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isStartNode(node) || isEndNode(node)) {
          continue;
        }
        if (node.id === id && node.scopedId === scopeId) {
          nodes[i].expanded = !nodes[i].expanded;
          return;
        }
        if (node.nodes.length > 0 && isExpanded(node)) {
          searchNode(node.nodes);
        }
      }
    };
    searchNode(originalNodes);
    setOriginalNodes([...originalNodes]);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <NodeExecutionsTimelineContext.Provider value={timelineContext}>
          <div className={styles.taskNames}>
            <Typography className={styles.taskNamesHeader}>Task Name</Typography>
            <TaskNames executions={nodeExecutions} nodes={nodes} ref={taskNamesRef} onToggle={toggleNode} />
          </div>
          <div className={styles.taskDurations}>
            <div className={styles.taskDurationsLabelsView} ref={durationsLabelsRef}>
              <div
                style={{
                  width: `${chartWidth}px`,
                  height: 41,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {labels.map((label, idx) => {
                  return (
                    <div
                      className={styles.taskDurationsLabelItem}
                      style={{
                        width: `${labelInterval}px`
                      }}
                      key={`duration-tick-${idx}`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.taskDurationsView} ref={durationsRef}>
              <div
                style={{
                  width: `${chartWidth + 20}px`,
                  height: `${56 * durationData.length + 20}px`,
                  marginTop: -10,
                  marginLeft: -15
                }}
              >
                <Bar options={options} data={chartData} />
              </div>
            </div>
          </div>
        </NodeExecutionsTimelineContext.Provider>
        <DetailsPanel open={selectedExecution !== null} onClose={onCloseDetailsPanel}>
          {selectedExecution != null ? (
            <NodeExecutionDetailsPanelContent onClose={onCloseDetailsPanel} nodeExecutionId={selectedExecution} />
          ) : null}
        </DetailsPanel>
      </div>
      <ExecutionTimelineFooter
        maxTime={120}
        onTimeIntervalChange={handleTimeIntervalChange}
        onTimezoneChange={handleTimezoneChange}
      />
    </div>
  );
};

export default ExecutionTimeline;
