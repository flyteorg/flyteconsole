import { makeStyles, Theme } from '@material-ui/core/styles';
import { storiesOf } from '@storybook/react';
import { makeNodeExecutionListQuery } from 'components/Executions/nodeExecutionQueries';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import * as React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { NodeExecutionsTable } from '../NodeExecutionsTable';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        borderLeft: `1px solid ${theme.palette.grey[400]}`,
        display: 'flex',
        height: '100vh',
        padding: `${theme.spacing(2)}px 0`,
        width: '100vw'
    }
}));

const fixture = basicPythonWorkflow.generate();
const workflowExecution = fixture.workflowExecutions.top.data;

const stories = storiesOf('Tables/NodeExecutionsTable', module);
stories.addDecorator(story => {
    return <div className={useStyles().container}>{story()}</div>;
});
stories.add('Basic', () => {
    const query = useQuery(makeNodeExecutionListQuery(useQueryClient(), workflowExecution.id));
    return query.data ? <NodeExecutionsTable nodeExecutions={query.data} /> : <div />;
});
stories.add('With no items', () => (
    <NodeExecutionsTable  nodeExecutions={[]} />
));
