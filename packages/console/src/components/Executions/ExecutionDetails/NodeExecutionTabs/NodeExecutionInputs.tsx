import { PanelSection } from 'components/common/PanelSection';
import { WaitForData } from 'components/common/WaitForData';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { LiteralMapViewer } from 'components/Literals/LiteralMapViewer';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';
import { ExecutionNodeURL } from '../ExecutionNodeURL';

/** Fetches and renders the input data for a given `NodeExecution` */
export const NodeExecutionInputs: React.FC<{
  execution: NodeExecution;
  taskIndex?: number;
}> = ({ execution, taskIndex }) => {
  const executionData = useNodeExecutionData(execution.id);

  return (
    <WaitForData {...executionData}>
      <PanelSection>
        <LiteralMapViewer
          map={executionData.value.fullInputs}
          mapTaskIndex={taskIndex}
        />
        {executionData.value.fullInputs?.literals && (
          <ExecutionNodeURL
            nodeExecutionId={execution.id}
            suffix="i"
          ></ExecutionNodeURL>
        )}
      </PanelSection>
    </WaitForData>
  );
};
