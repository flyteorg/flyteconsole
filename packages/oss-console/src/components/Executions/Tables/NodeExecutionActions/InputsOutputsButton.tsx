import React, { FC, useMemo } from 'react';
import { dNode } from '@clients/oss-console/models/Graph/types';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InputsAndOutputsIcon from '@mui/icons-material/Tv';
import t from '../strings';
import { useDetailsPanel } from '../../ExecutionDetails/DetailsPanelContext';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

export interface InputsOutputsButtonProps {
  node: dNode;
}
export const InputsOutputsButton: FC<InputsOutputsButtonProps> = ({ node }) => {
  const { nodeExecutionsById } = useNodeExecutionsById();

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId!],
    [nodeExecutionsById[node?.scopedId!]],
  );
  const { setSelectedExecution } = useDetailsPanel();

  // open the side panel for selected execution's detail
  const inputsAndOutputsIconOnClick = (e: React.MouseEvent<HTMLElement>) => {
    // prevent the parent row body onClick event trigger
    e.stopPropagation();
    // use null in case if there is no execution provided - when it is null will close panel
    setSelectedExecution(nodeExecution?.id ?? null);
  };

  return (
    <>
      <Tooltip title={t('inputsAndOutputsTooltip')}>
        <IconButton onClick={inputsAndOutputsIconOnClick} size="large">
          <InputsAndOutputsIcon data-testid={t('inputsAndOutputsTooltip')} />
        </IconButton>
      </Tooltip>
    </>
  );
};
