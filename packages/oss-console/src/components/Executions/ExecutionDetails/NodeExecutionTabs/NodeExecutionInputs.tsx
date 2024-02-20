import React from 'react';
import { WaitForQuery } from '../../../common/WaitForQuery';
import { PanelSection } from '../../../common/PanelSection';
import { useNodeExecutionDataQuery } from '../../../hooks/useNodeExecutionDataQuery';
import { LiteralMapViewer } from '../../../Literals/LiteralMapViewer';
import { NodeExecution } from '../../../../models/Execution/types';
import { ExecutionNodeURL } from '../ExecutionNodeURL';

/** Fetches and renders the input data for a given `NodeExecution` */
export const NodeExecutionInputs: React.FC<{
  execution: NodeExecution;
  taskIndex?: number;
}> = ({ execution, taskIndex }) => {
  const executionDataQuery = useNodeExecutionDataQuery({
    id: execution.id,
  });
  return (
    <WaitForQuery query={executionDataQuery}>
      {(data) => {
        const fullInputs = data?.fullInputs;
        const dataSourceURI = data?.flyteUrls?.inputs;
        const hasInputs = Object.keys(fullInputs?.literals || {}).length > 0;
        return (
          <>
            {hasInputs && taskIndex === undefined ? (
              <ExecutionNodeURL dataSourceURI={dataSourceURI} copyUrlText="Copy Inputs URI" />
            ) : null}
            <PanelSection>
              <LiteralMapViewer map={data?.fullInputs} mapTaskIndex={taskIndex} />
            </PanelSection>
          </>
        );
      }}
    </WaitForQuery>
  );
};
