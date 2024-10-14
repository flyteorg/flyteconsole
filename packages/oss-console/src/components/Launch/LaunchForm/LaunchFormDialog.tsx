import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { LaunchForm } from './LaunchForm';
import { ResourceIdentifier, ResourceType } from '../../../models/Common/types';
import { TaskInitialLaunchParameters, WorkflowInitialLaunchParameters } from './types';
import { CompiledNode } from '../../../models/Node/types';
import { NodeExecutionIdentifier } from '../../../models/Execution/types';
import { useEscapeKey } from '../../hooks/useKeyListener';
import { ResumeForm } from './ResumeForm';

interface LaunchFormDialogProps {
  id?: ResourceIdentifier;
  initialParameters?: TaskInitialLaunchParameters | WorkflowInitialLaunchParameters;
  showLaunchForm: boolean;
  setShowLaunchForm: React.Dispatch<React.SetStateAction<boolean>>;
  compiledNode?: CompiledNode;
  nodeExecutionId?: NodeExecutionIdentifier;
  nodeExecutionScopeId?: string;
}

function getLaunchProps(id: ResourceIdentifier) {
  if (id.resourceType === ResourceType.TASK) {
    return { taskId: id };
  }
  if (id.resourceType === ResourceType.WORKFLOW) {
    return { workflowId: id };
  }
  throw new Error('Unknown Resource Type');
}

export const LaunchFormDialog = ({
  id,
  initialParameters,
  showLaunchForm,
  setShowLaunchForm,
  compiledNode,
  nodeExecutionId,
  nodeExecutionScopeId,
}: LaunchFormDialogProps): JSX.Element => {
  const onCancelLaunch = (_?: any) => {
    setShowLaunchForm(false);
  };

  // Close modal on escape key press
  useEscapeKey(() => {
    onCancelLaunch();
  });

  // prevent child onclick event in the dialog triggers parent onclick event
  const dialogOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };
  console.log('kai', nodeExecutionScopeId);
  return (
    <Dialog
      scroll="paper"
      maxWidth="sm"
      fullWidth
      open={showLaunchForm}
      onClick={dialogOnClick}
      onClose={onCancelLaunch}
    >
      {id ? (
        <LaunchForm
          initialParameters={initialParameters}
          onClose={onCancelLaunch}
          {...getLaunchProps(id)}
        />
      ) : compiledNode && nodeExecutionId && nodeExecutionScopeId ? (
        <ResumeForm
          initialParameters={initialParameters}
          nodeExecutionId={nodeExecutionId}
          onClose={onCancelLaunch}
          compiledNode={compiledNode}
          nodeExecutionScopeId={nodeExecutionScopeId}
        />
      ) : null}
    </Dialog>
  );
};
