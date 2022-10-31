import { PanelSection } from 'components/common/PanelSection';
import { WaitForData, NodeExecution } from '@flyteconsole/components';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { LiteralMapViewer } from 'components/Literals/LiteralMapViewer';
import * as React from 'react';

/** Fetches and renders the output data for a given `NodeExecution` */
export const NodeExecutionOutputs: React.FC<{ execution: NodeExecution }> = ({ execution }) => {
  const executionData = useNodeExecutionData(execution.id);
  return (
    <WaitForData {...executionData}>
      <PanelSection>
        <LiteralMapViewer map={executionData.value.fullOutputs} />
      </PanelSection>
    </WaitForData>
  );
};
