import { WaitForQuery } from 'components/common/WaitForQuery';
import { ExecutionFilters } from 'components/Executions/ExecutionFilters';
import { useWorkflowExecutionFiltersState } from 'components/Executions/filters/useExecutionFiltersState';
import {
    WorkflowExecutionsTable,
    WorkflowExecutionsTableProps
} from 'components/Executions/Tables/WorkflowExecutionsTable';
import { makeWorkflowExecutionListQuery } from 'components/Executions/workflowExecutionQueries';
import { fetchStates } from 'components/hooks';
import { Execution, executionSortFields, SortDirection } from 'models';
import * as React from 'react';
import { useInfiniteQuery } from 'react-query';
import { State } from 'xstate';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column'
    }
}));
export interface ProjectExecutionsProps {
    projectId: string;
    domainId: string;
}

/** A listing of all executions across a project/domain combo */
export const ProjectExecutions: React.FC<ProjectExecutionsProps> = ({
    domainId: domain,
    projectId: project
}) => {
    const styles = useStyles();
    const filtersState = useWorkflowExecutionFiltersState();
    const sort = {
        key: executionSortFields.createdAt,
        direction: SortDirection.DESCENDING
    };

    const config = {
        sort,
        filter: filtersState.appliedFilters
    };

    const tableKey = `executions_${project}_${domain}`;

    const query = useInfiniteQuery({
        ...makeWorkflowExecutionListQuery({ domain, project }, config)
    });

    const executions = React.useMemo(
        () =>
            query.data?.pages
                ? query.data.pages.reduce<Execution[]>(
                      (acc, { data }) => acc.concat(data),
                      []
                  )
                : [],
        [query.data?.pages]
    );

    const renderTable = () => {
        const props: WorkflowExecutionsTableProps = {
            fetch: () => query.fetchNextPage(),
            value: executions,
            lastError: query.error,
            moreItemsAvailable: !!query.hasNextPage,
            showWorkflowName: true,
            state: State.from(
                query.isLoading ? fetchStates.LOADING : fetchStates.LOADED
            )
        };
        return <WorkflowExecutionsTable key={tableKey} {...props} />;
    };

    return (
        <div className={styles.container}>
            <ExecutionFilters {...filtersState} />
            <WaitForQuery query={query}>{renderTable}</WaitForQuery>
        </div>
    );
};
