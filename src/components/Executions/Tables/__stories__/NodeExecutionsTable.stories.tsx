import { makeStyles, Theme } from '@material-ui/core/styles';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { mockAPIContextValue } from 'components/data/__mocks__/apiContext';
import { ExecutionDataCacheContext } from 'components/Executions/contexts';
import { createExecutionDataCache } from 'components/Executions/useExecutionDataCache';
import {
    createMockWorkflow,
    createMockWorkflowClosure
} from 'models/__mocks__/workflowData';
import { createMockNodeExecutions } from 'models/Execution/__mocks__/mockNodeExecutionsData';
import { Execution } from 'models/Execution/types';
import { mockTasks } from 'models/Task/__mocks__/mockTaskData';
import * as React from 'react';
import {
    NodeExecutionsTable,
    NodeExecutionsTableProps
} from '../NodeExecutionsTable';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        borderLeft: `1px solid ${theme.palette.grey[400]}`,
        display: 'flex',
        height: '100vh',
        padding: `${theme.spacing(2)}px 0`,
        width: '100vw'
    }
}));

const {
    executions: mockExecutions,
    nodes: mockNodes
} = createMockNodeExecutions(10);

const mockWorkflow = createMockWorkflow('SampleWorkflow');
const mockWorkflowClosure = createMockWorkflowClosure();
const compiledWorkflow = mockWorkflowClosure.compiledWorkflow!;
const {
    primary: { template },
    tasks
} = compiledWorkflow;
template.nodes = template.nodes.concat(mockNodes);
compiledWorkflow.tasks = tasks.concat(mockTasks);
mockWorkflow.closure = mockWorkflowClosure;

const apiContext = mockAPIContextValue({});
const dataCache = createExecutionDataCache(apiContext);
dataCache.insertWorkflow(mockWorkflow);
dataCache.insertWorkflowExecutionReference(
    mockExecutions[0].id.executionId,
    mockWorkflow.id
);

const fetchAction = action('fetch');

const props: NodeExecutionsTableProps = {
    value: mockExecutions,
    lastError: null,
    loading: false,
    moreItemsAvailable: false,
    fetch: () => Promise.resolve(() => fetchAction() as unknown)
};

const stories = storiesOf('Tables/NodeExecutionsTable', module);
stories.addDecorator(story => {
    return (
        <ExecutionDataCacheContext.Provider value={dataCache}>
            <div className={useStyles().container}>{story()}</div>
        </ExecutionDataCacheContext.Provider>
    );
});
stories.add('Basic', () => <NodeExecutionsTable {...props} />);
stories.add('With no items', () => (
    <NodeExecutionsTable {...props} value={[]} />
));
