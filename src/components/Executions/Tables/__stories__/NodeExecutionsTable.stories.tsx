import { makeStyles, Theme } from '@material-ui/core/styles';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { createMockExecutionEntities } from 'components/Executions/__mocks__/createMockExecutionEntities';
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

const { nodeExecutions } = createMockExecutionEntities({
    workflowName: 'SampleWorkflow',
    nodeExecutionCount: 10
});

// const nodesById = keyBy(nodes, n => n.id);
// const nodesWithChildren = {
//     [nodes[0].id]: true,
//     [nodes[1].id]: true
// };
// const nodeRetryAttempts = {
//     [nodes[1].id]: 2
// };

// TODO: This needs to use MSW to generate responses for the data and provide a QueryClient.

const fetchAction = action('fetch');

const props: NodeExecutionsTableProps = {
    nodeExecutions
};

const stories = storiesOf('Tables/NodeExecutionsTable', module);
stories.addDecorator(story => {
    return <div className={useStyles().container}>{story()}</div>;
});
stories.add('Basic', () => <NodeExecutionsTable {...props} />);
stories.add('With no items', () => (
    <NodeExecutionsTable {...props} nodeExecutions={[]} />
));
