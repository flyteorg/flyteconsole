import React from 'react';

import { dNode } from '../../../../models/Graph/types';
import { ResumeButton } from './ResumeButton';
import { InputsOutputsButton } from './InputsOutputsButton';
import { RerunButton } from './RerunButton';

interface NodeExecutionActionsProps {
  node: dNode;
  className?: string;
}

export const NodeExecutionActions = ({ node }: NodeExecutionActionsProps): JSX.Element => {
  return (
    <div>
      <ResumeButton node={node} />

      <InputsOutputsButton node={node} />

      <RerunButton node={node} />
    </div>
  );
};
