import { makeStyles, Theme, Typography } from '@material-ui/core';
import * as moment from 'moment-timezone';
import { statusColors, tableHeaderColor } from 'components/Theme/constants';
import { Identifier } from 'models/Common/types';
import { NodeExecution, NodeExecutionIdentifier } from 'models/Execution/types';
import * as React from 'react';
import { NodeExecutionsTimelineContext } from './context';
import { NodeExecutionName } from './NodeExecutionName';
import { DetailsPanel } from 'components/common/DetailsPanel';
import { durationToMilliseconds, timestampToDate } from 'common/utils';
import { NodeExecutionDetailsPanelContent } from '../NodeExecutionDetailsPanelContent';
import { Chart as ChartJS, registerables } from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { ExecutionTimelineFooter } from './ExecutionTimelineFooter';
import { TimeZone } from './constant';
import { makeWorkflowQuery } from 'components/Workflow/workflowQueries';
import { Workflow, WorkflowClosure } from 'models/Workflow/types';
import { useQuery, useQueryClient } from 'react-query';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { DataError } from 'components/Errors/DataError';
import { dNode } from 'models/Graph/types';
import { transformerWorkflowToDAG } from 'components/WorkflowGraph/transformerWorkflowToDAG';
import { isEndNode, isStartNode } from 'components/WorkflowGraph/utils';

ChartJS.register(...registerables);

interface Props {
    nodeExecutions: NodeExecution[];
    workflowId: Identifier;
}

const useStyles = makeStyles((theme: Theme) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    container: {
        display: 'flex',
        flex: 1,
        overflowY: 'scroll'
    },
    taskNames: {
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.palette.divider}`
    },
    taskNamesHeader: {
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: '16px',
        color: tableHeaderColor,
        height: 45,
        display: 'flex',
        alignItems: 'center',
        borderBottom: `4px solid ${theme.palette.divider}`,
        paddingLeft: 30
    },
    taskDurations: {
        borderLeft: `1px solid ${theme.palette.divider}`,
        marginLeft: 4,
        flex: 1,
        overflow: 'auto'
    },
    namesContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 30px',
        height: 56,
        width: 300,
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

function TaskNames({ executions, nodes }) {
    const state = React.useContext(NodeExecutionsTimelineContext);
    const styles = useStyles();

    return (
        <>
            {nodes.map(node => {
                const execution = executions.find(
                    exec => exec.id.nodeId === node.id
                );
                if (execution) {
                    return (
                        <NodeExecutionName
                            execution={execution}
                            state={state}
                            key={`timeline-${execution.id.nodeId}`}
                        />
                    );
                }
                return (
                    <div
                        className={styles.namesContainer}
                        key={`task-name-${node.id}`}
                    >
                        {node.name}
                        <Typography
                            variant="subtitle1"
                            color="textSecondary"
                            className={styles.displayName}
                        >
                            {node.value.template.id.name}
                        </Typography>
                    </div>
                );
            })}
        </>
    );
}

const INTERVAL_LENGTH = 110;

export const ExecutionTimeline: React.FC<Props> = ({
    nodeExecutions,
    workflowId
}) => {
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
    const durationsRef = React.useRef<HTMLDivElement>(null);

    const { nodes: originalNodes } = transformerWorkflowToDAG(
        closure.compiledWorkflow!
    );
    const nodes = originalNodes.filter(
        node => !isStartNode(node) && !isEndNode(node)
    );

    const executionsMap = React.useMemo(() => {
        const mapData = {};
        nodeExecutions.forEach(execution => {
            mapData[execution.id.nodeId] = execution;
        });
        return mapData;
    }, [nodeExecutions]);

    const timelineContext = React.useMemo(
        () => ({ selectedExecution, setSelectedExecution }),
        [selectedExecution, setSelectedExecution]
    );

    const onCloseDetailsPanel = () => setSelectedExecution(null);
    const handleTimeIntervalChange = interval => setChartTimeInterval(interval);
    const handleTimezoneChange = tz => setChartTimezone(tz);

    console.log(nodeExecutions, nodes);

    const durationData = React.useMemo(() => {
        return nodes.map(nodeId => {
            const execution = executionsMap[nodeId.id];
            if (!execution || !execution.closure.duration) {
                return 0;
            }
            return durationToMilliseconds(execution.closure.duration) / 1000;
        });
    }, [executionsMap, nodes]);

    const colorData = React.useMemo(() => {
        return durationData.map(duration => {
            return duration === 0 ? statusColors.UNKNOWN : statusColors.SUCCESS;
        });
    }, [durationData]);

    const startedAt = React.useMemo(() => {
        if (nodeExecutions.length === 0) {
            return new Date();
        }
        return timestampToDate(nodeExecutions[0].closure.startedAt!);
    }, [nodeExecutions]);

    const stackedData = React.useMemo(() => {
        return nodes.map(node => {
            const exec = executionsMap[node.id];
            if (!exec) {
                return 100;
            }
            return (
                (timestampToDate(exec.closure.startedAt!).getTime() -
                    startedAt.getTime()) /
                1000
            );
        });
    }, [nodes, executionsMap, startedAt]);

    const chartData = React.useMemo(() => {
        return {
            labels: durationData.map(() => ''),
            datasets: [
                {
                    data: stackedData,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderWidth: 0
                },
                {
                    data: durationData.map(duration => {
                        console.log(duration);
                        return duration === 0 ? 0.5 : duration;
                    }),
                    backgroundColor: colorData,
                    barThickness: 50,
                    borderWidth: 0
                }
            ]
        };
    }, [durationData, stackedData, colorData]);

    console.log(durationData);

    const totalDuration = React.useMemo(() => {
        return durationData.reduce((prev, cur) => prev + cur, 0);
    }, [durationData]);

    React.useEffect(() => {
        const calcWidth = (totalDuration * INTERVAL_LENGTH) / chartTimeInterval;
        if (!durationsRef.current) {
            setChartWidth(calcWidth);
        } else if (calcWidth < durationsRef.current.clientWidth) {
            setChartWidth(durationsRef.current.clientWidth);
        } else {
            setChartWidth(calcWidth);
        }
    }, [totalDuration, chartTimeInterval, durationsRef]);

    React.useEffect(() => {
        const el = durationsRef.current;
        if (el) {
            const handleScroll = e => {
                el.scrollTo({
                    left: el.scrollLeft + e.deltaY,
                    behavior: 'smooth'
                });
            };

            el.addEventListener('wheel', handleScroll);

            return () => el.removeEventListener('wheel', handleScroll);
        }

        return () => {};
    }, [durationsRef]);

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
                    align: 'start' as const,
                    callback: function(value) {
                        const time = moment.utc(
                            new Date(startedAt.getTime() + value * 1000)
                        );
                        return chartTimezone === TimeZone.UTC
                            ? time.format('hh:mm:ss A')
                            : time.local().format('hh:mm:ss A');
                    },
                    stepSize: chartTimeInterval
                },
                stacked: true,
                afterTickToLabelConversion: function(scaleInstance) {
                    scaleInstance.ticks[scaleInstance.ticks.length - 1] = {};
                }
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
                        <TaskNames executions={nodeExecutions} nodes={nodes} />
                    </div>
                    <div className={styles.taskDurations} ref={durationsRef}>
                        <div
                            style={{
                                width: `${chartWidth}px`,
                                height: `${55 * durationData.length + 52}px`,
                                marginTop: 15,
                                marginLeft: -10
                            }}
                        >
                            <Bar options={options} data={chartData} />
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
