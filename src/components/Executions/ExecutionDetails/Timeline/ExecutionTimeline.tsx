import { makeStyles, Theme, Typography } from '@material-ui/core';
import { tableHeaderColor } from 'components/Theme/constants';
import { NodeExecution, NodeExecutionIdentifier } from 'models/Execution/types';
import * as React from 'react';
import { NodeExecutionsTimelineContext } from './context';
import { NodeExecutionName } from './NodeExecutionName';

interface Props {
    nodeExecutions: NodeExecution[];
}

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        display: 'flex'
    },
    taskNames: {
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`
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
    }
}));

export const ExecutionTimeline: React.FC<Props> = ({ nodeExecutions }) => {
    const styles = useStyles();
    const state = React.useContext(NodeExecutionsTimelineContext);
    const [
        selectedExecution,
        setSelectedExecution
    ] = React.useState<NodeExecutionIdentifier | null>(null);

    const timelineContext = React.useMemo(
        () => ({ selectedExecution, setSelectedExecution }),
        [selectedExecution, setSelectedExecution]
    );

    console.log(nodeExecutions);

    return (
        <div className={styles.container}>
            <NodeExecutionsTimelineContext.Provider value={timelineContext}>
                <div className={styles.taskNames}>
                    <Typography className={styles.taskNamesHeader}>
                        Task Name
                    </Typography>
                    {nodeExecutions.map(execution => (
                        <NodeExecutionName
                            execution={execution}
                            state={state}
                            key={`timeline-${execution.id.nodeId}`}
                        />
                    ))}
                </div>
            </NodeExecutionsTimelineContext.Provider>
        </div>
    );
};
