import { PanelSection } from 'components/common/PanelSection';
import { WaitForData } from 'components/common/WaitForData';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { LiteralMapViewer } from 'components/Literals/LiteralMapViewer';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';
import { ExecutionNodeURL } from '../ExecutionNodeURL';

/** Fetches and renders the output data for a given `NodeExecution` */
export const NodeExecutionOutputs: React.FC<{
  execution: NodeExecution;
  taskIndex?: number;
}> = ({ execution, taskIndex }) => {
  const executionData = useNodeExecutionData(execution.id);

  return (
    <WaitForData {...executionData}>
      <PanelSection>
        {executionData.value?.flyteUrls?.outputs ? (
          <ExecutionNodeURL
            nodeExecutionId={execution.id}
            dataSourceURI={executionData.value?.flyteUrls?.outputs}
            copyUrlText="Copy Outputs URI"
          />
        ) : null}
        <LiteralMapViewer
          map={executionData.value.fullOutputs}
          mapTaskIndex={taskIndex}
        />
      </PanelSection>
    </WaitForData>
  );
};
