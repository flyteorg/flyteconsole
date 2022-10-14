import { Dialog } from '@material-ui/core';
import * as React from 'react';
import { ResourceIdentifier } from 'models/Common/types';
import { TaskInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import { ResumeForm } from './ResumeForm';

interface ResumeFormDialogProps {
  id: ResourceIdentifier;
  initialParameters: TaskInitialLaunchParameters | undefined;
  showResumeForm: boolean;
  setShowResumeForm: React.Dispatch<React.SetStateAction<boolean>>;
  nodeExecutionId: NodeExecutionIdentifier;
}

export const ResumeFormDialog = (props: ResumeFormDialogProps): JSX.Element => {
  const { id, initialParameters, showResumeForm, setShowResumeForm, nodeExecutionId } = props;

  const onCancelResume = () => setShowResumeForm(false);

  // prevent child onclick event in the dialog triggers parent onclick event
  const dialogOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <Dialog
      scroll="paper"
      maxWidth="sm"
      fullWidth={true}
      open={showResumeForm}
      onClick={dialogOnClick}
    >
      <ResumeForm
        initialParameters={initialParameters}
        nodeExecutionId={nodeExecutionId}
        onClose={onCancelResume}
        taskId={id}
      />
    </Dialog>
  );
};
