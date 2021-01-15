import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { contentMarginGridUnits } from 'common/layout';
import { WaitForData } from 'components/common/WaitForData';
import { ExecutionFilters } from 'components/Executions/ExecutionFilters';
import { useWorkflowExecutionFiltersState } from 'components/Executions/filters/useExecutionFiltersState';
import { WorkflowExecutionsTable } from 'components/Executions/Tables/WorkflowExecutionsTable';
import { isLoadingState } from 'components/hooks/fetchMachine';
import { useWorkflowExecutions } from 'components/hooks/useWorkflowExecutions';
import { SortDirection } from 'models/AdminEntity/types';
import { ResourceIdentifier } from 'models/Common/types';
import { executionSortFields } from 'models/Execution/constants';
import * as React from 'react';
import { executionFilterGenerator } from './generators';

const useStyles = makeStyles((theme: Theme) => ({
    filtersContainer: {
        borderTop: `1px solid ${theme.palette.divider}`
    },
    header: {
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(contentMarginGridUnits)
    }
}));

export interface EntityExecutionsProps {
    id: ResourceIdentifier;
}

/** The tab/page content for viewing a workflow's executions */
export const EntityExecutions: React.FC<EntityExecutionsProps> = ({ id }) => {
    const { domain, project, resourceType } = id;
    const styles = useStyles();
    const filtersState = useWorkflowExecutionFiltersState();
    const sort = {
        key: executionSortFields.createdAt,
        direction: SortDirection.DESCENDING
    };

    const baseFilters = React.useMemo(
        () => executionFilterGenerator[resourceType](id),
        [id]
    );

    const executions = useWorkflowExecutions(
        { domain, project },
        {
            sort,
            filter: [...baseFilters, ...filtersState.appliedFilters]
        }
    );

    return (
        <>
            <Typography className={styles.header} variant="h6">
                Executions
            </Typography>
            <div className={styles.filtersContainer}>
                <ExecutionFilters {...filtersState} />
            </div>
            <WaitForData {...executions}>
                <WorkflowExecutionsTable
                    {...executions}
                    isFetching={isLoadingState(executions.state)}
                />
            </WaitForData>
        </>
    );
};
