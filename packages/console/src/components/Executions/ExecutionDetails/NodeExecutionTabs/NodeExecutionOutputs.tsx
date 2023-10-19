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
        {(() => {
          const data = executionData?.value;
          const fullOutputs = data?.fullOutputs;
          const dataSourceURI = data?.flyteUrls?.outputs;
          const hasOutputs =
            Object.keys(fullOutputs?.literals || {}).length > 0;
          return (
            <>
              {hasOutputs && taskIndex === undefined ? (
                <ExecutionNodeURL
                  dataSourceURI={dataSourceURI}
                  copyUrlText="Copy Outputs URI"
                />
              ) : null}
              <LiteralMapViewer map={fullOutputs} mapTaskIndex={taskIndex} />
            </>
          );
        })()}
      </PanelSection>
    </WaitForData>
  );
};
