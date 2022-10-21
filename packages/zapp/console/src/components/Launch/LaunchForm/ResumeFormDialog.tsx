import { Dialog } from '@material-ui/core';
import * as React from 'react';
import { TaskInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { CompiledNode } from 'models/Node/types';
import { ResumeForm } from './ResumeForm';

interface ResumeFormDialogProps {
  compiledNode: CompiledNode;
  initialParameters: TaskInitialLaunchParameters | undefined;
  showResumeForm: boolean;
  setShowResumeForm: React.Dispatch<React.SetStateAction<boolean>>;
  nodeId: string;
}

export const ResumeFormDialog = (props: ResumeFormDialogProps): JSX.Element => {
  const { compiledNode, initialParameters, showResumeForm, setShowResumeForm, nodeId } = props;

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
        nodeId={nodeId}
        onClose={onCancelResume}
        compiledNode={compiledNode}
      />
    </Dialog>
  );
};
