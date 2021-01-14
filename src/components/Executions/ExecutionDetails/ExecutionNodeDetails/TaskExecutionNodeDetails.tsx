import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { noExecutionsFoundString } from 'common/constants';
import { NonIdealState } from 'components/common/NonIdealState';
import { SectionHeader } from 'components/common/SectionHeader';
import { ExecutionStatusBadge } from 'components/Executions/ExecutionStatusBadge';
import { TaskExecutionsList } from 'components/Executions/TaskExecutionsList/TaskExecutionsList';
import { useTabState } from 'components/hooks/useTabState';
import { NodeDetailsProps } from 'components/WorkflowGraph/NodeDetails/NodeDetails';
import { SelectNode } from 'components/WorkflowGraph/NodeDetails/SelectNode';
import { useStyles as useBaseStyles } from 'components/WorkflowGraph/NodeDetails/styles';
import * as React from 'react';
import { NodeExecutionsContext } from '../../contexts';
import { NodeExecutionInputs } from '../NodeExecutionInputs';
import { NodeExecutionOutputs } from '../NodeExecutionOutputs';

const tabIds = {
    executions: 'data',
    inputs: 'inputs',
    outputs: 'outputs'
};

const NoExecutionsAvailable: React.FC = () => (
    <NonIdealState
        description="This node has not been executed"
        title={noExecutionsFoundString}
        size="small"
    />
);

/** DetailsPanel content which renders execution information about a given
 * graph node.
 */
export const TaskExecutionNodeDetails: React.FC<NodeDetailsProps> = props => {
    const { node } = props;
    const nodeId = node ? node.id : '';
    const nodeExecutions = React.useContext(NodeExecutionsContext);
    const tabState = useTabState(tabIds, tabIds.executions);
    const execution = nodeExecutions[nodeId];
    const baseStyles = useBaseStyles();

    if (!node) {
        return <SelectNode />;
    }

    let statusContent;
    let executionDetailsContent;
    if (execution) {
        statusContent = (
            <ExecutionStatusBadge phase={execution.closure.phase} type="node" />
        );
        executionDetailsContent = (
            <TaskExecutionsList nodeExecution={execution} />
        );
    } else {
        executionDetailsContent = <NoExecutionsAvailable />;
    }

    return (
        <section className={baseStyles.container}>
            <header className={baseStyles.header}>
                <div className={baseStyles.headerContent}>
                    <SectionHeader title={node.id} />
                    {statusContent}
                </div>
            </header>
            <Tabs {...tabState} className={baseStyles.tabs}>
                <Tab value={tabIds.executions} label="Executions" />
                {execution && <Tab value={tabIds.inputs} label="Inputs" />}
                {execution && <Tab value={tabIds.outputs} label="Outputs" />}
            </Tabs>
            <div className={baseStyles.content}>
                {tabState.value === tabIds.executions &&
                    executionDetailsContent}
                {tabState.value === tabIds.inputs && (
                    <NodeExecutionInputs execution={execution} />
                )}
                {tabState.value === tabIds.outputs && (
                    <NodeExecutionOutputs execution={execution} />
                )}
            </div>
        </section>
    );
};
