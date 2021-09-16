import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformerDAGToReactFlow';
import * as React from 'react';
import { RFWrapperProps, RFGraphTypes, ConvertDagProps } from './types';
import { getRFBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';

/**
 * Renders workflow graph using React Flow.
 * @param props.data    DAG from transformerWorkflowToDAG
 * @returns ReactFlow Graph as <ReactFlowWrapper>
 */
const ReactFlowGraphComponent = props => {
    const { data, onNodeSelectionChanged, nodeExecutionsById } = props;
    const rfGraphJson = ConvertFlyteDagToReactFlows({
        root: data,
        nodeExecutionsById: nodeExecutionsById,
        onNodeSelectionChanged: onNodeSelectionChanged,
        maxRenderDepth: 2
    } as ConvertDagProps);

    const backgroundStyle = getRFBackground(data.nodeExecutionStatus).nested;
    const ReactFlowProps: RFWrapperProps = {
        backgroundStyle,
        rfGraphJson: rfGraphJson,
        type: RFGraphTypes.main
    };
    return <ReactFlowWrapper {...ReactFlowProps} />;
};

export default ReactFlowGraphComponent;
