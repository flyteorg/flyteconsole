import { makeStyles, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { useCommonStyles } from 'components/common/styles';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { SelectNodeExecutionLink } from 'components/Executions/Tables/SelectNodeExecutionLink';
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

const useStyles = makeStyles((theme: Theme) => ({
    container: {
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
    },
    selectedExecutionName: {
        fontWeight: 'bold'
    }
}));

export const NodeExecutionName: React.FC<NodeExecutionTimelineNameData> = ({
    execution,
    state
}) => {
    const detailsQuery = useNodeExecutionDetails(execution);
    const commonStyles = useCommonStyles();
    const styles = useStyles();

    const isSelected =
        state.selectedExecution != null &&
        isEqual(execution.id, state.selectedExecution);

    const renderReadableName = ({ displayName }: NodeExecutionDetails) => {
        const truncatedName = displayName?.split('.').pop() || '';
        const readableName = isSelected ? (
            <Typography
                variant="body1"
                className={styles.selectedExecutionName}
            >
                {truncatedName}
            </Typography>
        ) : (
            <SelectNodeExecutionLink
                className={commonStyles.primaryLink}
                execution={execution}
                linkText={truncatedName || ''}
                state={state}
            />
        );
        return (
            <div className={styles.container}>
                {readableName}
                <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    className={styles.displayName}
                >
                    {displayName}
                </Typography>
            </div>
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
