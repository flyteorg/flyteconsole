import { makeStyles, Theme, Typography } from '@material-ui/core';
import * as moment from 'moment-timezone';
import { statusColors, tableHeaderColor } from 'components/Theme/constants';
import { Identifier } from 'models/Common/types';
import { NodeExecution, NodeExecutionIdentifier } from 'models/Execution/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import * as React from 'react';
import { NodeExecutionsTimelineContext } from './context';
import { NodeExecutionName } from './NodeExecutionName';
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
import { isEndNode, isStartNode } from 'components/WorkflowGraph/utils';

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
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 30px',
        height: 56,
        width: 256,
        borderBottom: `1px solid ${theme.palette.divider}`,
        whiteSpace: 'nowrap'
    },
    displayName: {
        marginTop: 4,
        textOverflow: 'ellipsis',
        width: '100%',
        overflow: 'hidden'
    }
}));

interface TaskNamesProps {
    executions: NodeExecution[];
    nodes: dNode[];
}

const TaskNames = React.forwardRef<HTMLDivElement, TaskNamesProps>(
    (props, ref) => {
        const { executions, nodes } = props;
        const state = React.useContext(NodeExecutionsTimelineContext);
        const styles = useStyles();

        const executionsMap = React.useMemo(
            () =>
                executions.reduce(
                    (mapData, cur) => ({ ...mapData, [cur.id.nodeId]: cur }),
                    {}
                ),
            [executions]
        );

        return (
            <div className={styles.taskNamesList} ref={ref}>
                {executions.map(execution => (
                    <NodeExecutionName
                        execution={execution}
                        state={state}
                        key={`task-name-${execution.id.nodeId}`}
                    />
                ))}
                {nodes
                    .filter(node => !executionsMap[node.scopedId])
                    .map(node => (
                        <div
                            className={styles.namesContainer}
                            key={`task-name-${node.scopedId}`}
                        >
                            {node.name}
                            <Typography
                                variant="subtitle1"
                                color="textSecondary"
                                className={styles.displayName}
                            >
                                {node.value.template?.id?.name}
                            </Typography>
                        </div>
                    ))}
            </div>
        );
    }
);

const INTERVAL_LENGTH = 110;

const ExecutionTimeline: React.FC<Props> = ({ nodeExecutions, workflowId }) => {
    const workflowQuery = useQuery<Workflow, Error>(
        makeWorkflowQuery(useQueryClient(), workflowId)
    );

    return (
        <WaitForQuery query={workflowQuery} errorComponent={DataError}>
            {props => (
                <ExecutionTimelineWithNodes
                    closure={props.closure!}
                    nodeExecutions={nodeExecutions}
                    workflowId={workflowId}
                />
            )}
        </WaitForQuery>
    );
};

function convertToPlainNodes(nodes: dNode[]): dNode[] {
    const result: dNode[] = [];
    if (!nodes || nodes.length === 0) {
        return result;
    }
    nodes.forEach(node => {
        if (isStartNode(node) || isEndNode(node)) {
            return;
        }
        result.push(node);
        if (node.nodes.length > 0) {
            result.push(...convertToPlainNodes(node.nodes));
        }
    });
    return result;
}

export const ExecutionTimelineWithNodes: React.FC<Props & {
    closure: WorkflowClosure;
}> = ({ nodeExecutions, closure }) => {
    const styles = useStyles();
    const [
        selectedExecution,
        setSelectedExecution
    ] = React.useState<NodeExecutionIdentifier | null>(null);
    const [chartTimeInterval, setChartTimeInterval] = React.useState(12);
    const [chartTimezone, setChartTimezone] = React.useState(TimeZone.Local);
    const [chartWidth, setChartWidth] = React.useState(0);
    const [labelInterval, setLabelInterval] = React.useState(INTERVAL_LENGTH);
    const durationsRef = React.useRef<HTMLDivElement>(null);
    const durationsLabelsRef = React.useRef<HTMLDivElement>(null);
    const taskNamesRef = React.createRef<HTMLDivElement>();

    const { nodes: originalNodes } = transformerWorkflowToPlainNodes(
        closure.compiledWorkflow!
    );
    const nodes = convertToPlainNodes(originalNodes);

    const executionsMap = React.useMemo(
        () =>
            nodeExecutions.reduce(
                (mapData, cur) => ({ ...mapData, [cur.id.nodeId]: cur }),
                {}
            ),
        [nodeExecutions]
    );

    const timelineContext = React.useMemo(
        () => ({ selectedExecution, setSelectedExecution }),
        [selectedExecution, setSelectedExecution]
    );

    const onCloseDetailsPanel = () => setSelectedExecution(null);
    const handleTimeIntervalChange = interval => setChartTimeInterval(interval);
    const handleTimezoneChange = tz => setChartTimezone(tz);

    // Divide by 1000 to calculate all duration data be second based.
    const durationData = React.useMemo(() => {
        const definedExecutions = nodeExecutions.map(exec => {
            if (exec.closure.phase === NodeExecutionPhase.RUNNING) {
                if (!exec.closure.startedAt) {
                    return 0;
                }
                return (
                    (Date.now() -
                        timestampToDate(exec.closure.startedAt).getTime()) /
                    1000
                );
            }
            if (!exec.closure.duration) {
                return 0;
            }
            return durationToMilliseconds(exec.closure.duration) / 1000;
        });
        return [
            ...definedExecutions,
            ...nodes.filter(node => !executionsMap[node.scopedId]).map(() => -1)
        ];
    }, [nodeExecutions, executionsMap, nodes]);

    const colorData = React.useMemo(() => {
        const definedExecutions = nodeExecutions.map(exec =>
            exec.closure.phase === NodeExecutionPhase.RUNNING
                ? '#4b92ed'
                : statusColors.SUCCESS
        );
        return [
            ...definedExecutions,
            ...nodes
                .filter(node => !executionsMap[node.scopedId])
                .map(() => statusColors.UNKNOWN)
        ];
    }, [nodeExecutions, executionsMap, nodes]);

    const startedAt = React.useMemo(() => {
        if (
            nodeExecutions.length === 0 ||
            !nodeExecutions[0].closure.startedAt
        ) {
            return new Date();
        }
        return timestampToDate(nodeExecutions[0].closure.startedAt);
    }, [nodeExecutions]);

    const stackedData = React.useMemo(() => {
        let undefinedStart = 0;
        for (const exec of nodeExecutions) {
            if (exec.closure.startedAt) {
                const startedTime = timestampToDate(
                    exec.closure.startedAt
                ).getTime();
                const absoluteDuration =
                    startedTime -
                    startedAt.getTime() +
                    (exec.closure.duration
                        ? durationToMilliseconds(exec.closure.duration)
                        : Date.now() - startedTime);
                if (absoluteDuration > undefinedStart) {
                    undefinedStart = absoluteDuration;
                }
            }
        }
        undefinedStart = undefinedStart / 1000;

        const definedExecutions = nodeExecutions.map(exec =>
            exec.closure.startedAt
                ? (timestampToDate(exec.closure.startedAt).getTime() -
                      startedAt.getTime()) /
                  1000
                : 0
        );

        return [
            ...definedExecutions,
            ...nodes
                .filter(node => !executionsMap[node.scopedId])
                .map(() => undefinedStart)
        ];
    }, [nodes, nodeExecutions, executionsMap, startedAt]);

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
                        return duration === -1
                            ? 10
                            : duration === 0
                            ? 0.5
                            : duration;
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
        const durations = durationData.map(
            (duration, idx) => duration + stackedData[idx]
        );
        return Math.max(...durations);
    }, [durationData, stackedData]);

    React.useEffect(() => {
        const calcWidth =
            Math.ceil(totalDuration / chartTimeInterval) * INTERVAL_LENGTH;
        if (!durationsRef.current) {
            setChartWidth(calcWidth);
            setLabelInterval(INTERVAL_LENGTH);
        } else if (calcWidth < durationsRef.current.clientWidth) {
            setLabelInterval(
                durationsRef.current.clientWidth /
                    Math.ceil(totalDuration / chartTimeInterval)
            );
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

            return () =>
                durationsView.removeEventListener('wheel', handleScroll);
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
                        top: canvasView.scrollTop + e.deltaY,
                        behavior: 'smooth'
                    });
                }
            };

            el.addEventListener('wheel', handleScroll);

            return () => el.removeEventListener('wheel', handleScroll);
        }

        return () => {};
    }, [taskNamesRef, durationsRef]);

    const labels = React.useMemo(() => {
        const lbs = new Array(
            Math.ceil(totalDuration / chartTimeInterval)
        ).fill(0);
        return lbs.map((_, idx) => {
            const time = moment.utc(
                new Date(startedAt.getTime() + idx * chartTimeInterval * 1000)
            );
            return chartTimezone === TimeZone.UTC
                ? time.format('hh:mm:ss A')
                : time.local().format('hh:mm:ss A');
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

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <NodeExecutionsTimelineContext.Provider value={timelineContext}>
                    <div className={styles.taskNames}>
                        <Typography className={styles.taskNamesHeader}>
                            Task Name
                        </Typography>
                        <TaskNames
                            executions={nodeExecutions}
                            nodes={nodes}
                            ref={taskNamesRef}
                        />
                    </div>
                    <div className={styles.taskDurations}>
                        <div
                            className={styles.taskDurationsLabelsView}
                            ref={durationsLabelsRef}
                        >
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
                                            className={
                                                styles.taskDurationsLabelItem
                                            }
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
                        <div
                            className={styles.taskDurationsView}
                            ref={durationsRef}
                        >
                            <div
                                style={{
                                    width: `${chartWidth + 20}px`,
                                    height: `${56 * durationData.length +
                                        20}px`,
                                    marginTop: -10,
                                    marginLeft: -15
                                }}
                            >
                                <Bar options={options} data={chartData} />
                            </div>
                        </div>
                    </div>
                </NodeExecutionsTimelineContext.Provider>
                <DetailsPanel
                    open={selectedExecution !== null}
                    onClose={onCloseDetailsPanel}
                >
                    {selectedExecution != null ? (
                        <NodeExecutionDetailsPanelContent
                            onClose={onCloseDetailsPanel}
                            nodeExecutionId={selectedExecution}
                        />
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
