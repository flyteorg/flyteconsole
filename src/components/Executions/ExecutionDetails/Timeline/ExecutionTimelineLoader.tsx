import { WaitForQuery } from 'components/common/WaitForQuery';
import { DataError } from 'components/Errors/DataError';
import * as React from 'react';
import { useAllTreeNodeExecutionGroupsQuery } from '../../nodeExecutionQueries';
import { NodeExecutionsRequestConfigContext } from '../../contexts';
import { NodeExecution } from 'models/Execution/types';
import ExecutionTimeline from './ExecutionTimeline';

export const ExecutionTimelineLoader = ({ nodeExecutions, workflowId }) => {
    const requestConfig = React.useContext(NodeExecutionsRequestConfigContext);
    const childGroupsQuery = useAllTreeNodeExecutionGroupsQuery(
        nodeExecutions,
        requestConfig
    );

    const renderTimelineComponent = (executions: NodeExecution[]) => {
        return nodeExecutions.length > 0 ? (
            <ExecutionTimeline
                nodeExecutions={executions}
                workflowId={workflowId}
            />
        ) : null;
    };

    return (
        <WaitForQuery errorComponent={DataError} query={childGroupsQuery}>
            {renderTimelineComponent}
        </WaitForQuery>
    );
};
