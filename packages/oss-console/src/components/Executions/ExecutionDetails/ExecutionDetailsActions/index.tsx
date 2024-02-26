import React from 'react';
import classnames from 'classnames';
import styled from '@mui/system/styled';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { NodeExecutionDetails } from '../../types';
import { WorkflowNodeExecution } from '../../contexts';
import { FlyteDeckButton } from './FlyteDeckButton';
import { RerunButton } from './RerunButton';
import { ResumeButton } from './ResumeButton';

const ActionsContainer = styled('div')(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  '& button': {
    marginRight: theme.spacing(1),
  },
}));

interface ExecutionDetailsActionsProps {
  className?: string;
  nodeExecutionDetails?: NodeExecutionDetails;
  nodeExecution: WorkflowNodeExecution;
  phase: NodeExecutionPhase;
  text?: {
    flyteDeckText?: string;
    rerunText?: string;
    resumeText?: string;
  };
}

export const ExecutionDetailsActions = ({
  className,
  nodeExecutionDetails,
  nodeExecution,
  phase,
  text,
}: ExecutionDetailsActionsProps): JSX.Element => {
  return (
    <>
      <ActionsContainer
        className={classnames(className)}
        key={`actions-container-${nodeExecution?.scopedId}`}
      >
        <FlyteDeckButton
          nodeExecution={nodeExecution}
          phase={phase}
          flyteDeckText={text?.flyteDeckText}
        />
        <RerunButton
          nodeExecution={nodeExecution}
          nodeExecutionDetails={nodeExecutionDetails}
          text={text?.rerunText}
        />

        <ResumeButton
          phase={phase}
          nodeExecution={nodeExecution}
          nodeExecutionDetails={nodeExecutionDetails}
          text={text?.resumeText}
        />
      </ActionsContainer>
    </>
  );
};
