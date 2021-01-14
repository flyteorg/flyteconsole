import { NodeDetailsProps } from 'components/WorkflowGraph/NodeDetails/NodeDetails';
import { SelectNode } from 'components/WorkflowGraph/NodeDetails/SelectNode';
import { isEndNode, isStartNode } from 'components/WorkflowGraph/utils';
import * as React from 'react';
import { InputNodeDetails } from './InputNodeDetails';
import { OutputNodeDetails } from './OutputNodeDetails';
import { TaskExecutionNodeDetails } from './TaskExecutionNodeDetails';

/** DetailsPanel content which renders execution information about a given
 * graph node.
 */
export const ExecutionNodeDetails: React.FC<NodeDetailsProps> = props => {
    const { node } = props;
    if (!node) {
        return <SelectNode />;
    }

    if (isStartNode(node)) {
        return <InputNodeDetails {...props} />;
    }
    if (isEndNode(node)) {
        return <OutputNodeDetails {...props} />;
    }

    return <TaskExecutionNodeDetails {...props} />;
};
