import Typography from '@material-ui/core/Typography';
import { useCommonStyles } from 'components/common/styles';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { SelectNodeExecutionLink } from 'components/Executions/Tables/SelectNodeExecutionLink';
import { useColumnStyles } from 'components/Executions/Tables/styles';
import { NodeExecutionDetails } from 'components/Executions/types';
import { useNodeExecutionDetails } from 'components/Executions/useNodeExecutionDetails';
import { isEqual } from 'lodash';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';
import { NodeExecutionsTimelineContextData } from './context';

interface NodeExecutionTimelineNameData {
    execution: NodeExecution;
    state: NodeExecutionsTimelineContextData;
}

export const NodeExecutionName: React.FC<NodeExecutionTimelineNameData> = ({
    execution,
    state
}) => {
    const detailsQuery = useNodeExecutionDetails(execution);
    const commonStyles = useCommonStyles();
    const styles = useColumnStyles();
    const nodeId = execution.id.nodeId;

    const isSelected =
        state.selectedExecution != null &&
        isEqual(execution.id, state.selectedExecution);

    const renderReadableName = ({
        displayId,
        displayName
    }: NodeExecutionDetails) => {
        const readableName = isSelected ? (
            <Typography
                variant="body1"
                className={styles.selectedExecutionName}
            >
                {displayId || nodeId}
            </Typography>
        ) : (
            <SelectNodeExecutionLink
                className={commonStyles.primaryLink}
                execution={execution}
                linkText={displayId || nodeId}
                state={state}
            />
        );
        return (
            <>
                {readableName}
                <Typography variant="subtitle1" color="textSecondary">
                    {displayName}
                </Typography>
            </>
        );
    };

    return (
        <>
            <WaitForQuery query={detailsQuery}>
                {renderReadableName}
            </WaitForQuery>
        </>
    );
};
