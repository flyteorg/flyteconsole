import React from 'react';
import { PanelSection } from '../../../common/PanelSection';
import { WaitForQuery } from '../../../common/WaitForQuery';
import { useNodeExecutionDataQuery } from '../../../hooks/useNodeExecutionDataQuery';
import { LiteralMapViewer } from '../../../Literals/LiteralMapViewer';
import { NodeExecution } from '../../../../models/Execution/types';
import { ExecutionNodeURL } from '../ExecutionNodeURL';

/** Fetches and renders the output data for a given `NodeExecution` */
export const NodeExecutionOutputs: React.FC<{
  execution: NodeExecution;
  taskIndex?: number;
}> = ({ execution, taskIndex }) => {
  const executionDataQuery = useNodeExecutionDataQuery({
    id: execution.id,
  });
  return (
    <WaitForQuery query={executionDataQuery}>
      {(data) => {
        const fullOutputs = data?.fullOutputs;
        const dataSourceURI = data?.flyteUrls?.outputs;
        const hasOutputs = Object.keys(fullOutputs?.literals || {}).length > 0;

        return (
          <>
            {hasOutputs && taskIndex === undefined ? (
              <ExecutionNodeURL dataSourceURI={dataSourceURI} copyUrlText="Copy Outputs URI" />
            ) : null}
            <PanelSection>
              <LiteralMapViewer map={data?.fullOutputs} mapTaskIndex={taskIndex} />
            </PanelSection>
          </>
        );
      }}
    </WaitForQuery>
  );
};
