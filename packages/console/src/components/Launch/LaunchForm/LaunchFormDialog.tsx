import { Dialog } from '@material-ui/core';
import * as React from 'react';
import { LaunchForm } from 'components/Launch/LaunchForm/LaunchForm';
import { ResourceIdentifier, ResourceType } from 'models/Common/types';
import {
  TaskInitialLaunchParameters,
  WorkflowInitialLaunchParameters,
} from 'components/Launch/LaunchForm/types';
import { CompiledNode } from 'models/Node/types';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import { useEscapeKey } from 'components/hooks/useKeyListener';
import { ResumeForm } from './ResumeForm';

interface LaunchFormDialogProps {
  id?: ResourceIdentifier;
  initialParameters?:
    | TaskInitialLaunchParameters
    | WorkflowInitialLaunchParameters;
  showLaunchForm: boolean;
  setShowLaunchForm: React.Dispatch<React.SetStateAction<boolean>>;
  compiledNode?: CompiledNode;
  nodeExecutionId?: NodeExecutionIdentifier;
}

function getLaunchProps(id: ResourceIdentifier) {
  if (id.resourceType === ResourceType.TASK) {
    return { taskId: id };
  } else if (id.resourceType === ResourceType.WORKFLOW) {
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
}: LaunchFormDialogProps): JSX.Element => {
  const onCancelLaunch = (_?: any) => setShowLaunchForm(false);

  // Close modal on escape key press
  useEscapeKey(onCancelLaunch);

  // prevent child onclick event in the dialog triggers parent onclick event
  const dialogOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <Dialog
      scroll="paper"
      maxWidth="sm"
      fullWidth={true}
      open={showLaunchForm}
      onClick={dialogOnClick}
    >
      {id ? (
        <LaunchForm
          initialParameters={initialParameters}
          onClose={onCancelLaunch}
          {...getLaunchProps(id)}
        />
      ) : compiledNode && nodeExecutionId ? (
        <ResumeForm
          initialParameters={initialParameters}
          nodeExecutionId={nodeExecutionId}
          onClose={onCancelLaunch}
          compiledNode={compiledNode}
        />
      ) : null}
    </Dialog>
  );
};
