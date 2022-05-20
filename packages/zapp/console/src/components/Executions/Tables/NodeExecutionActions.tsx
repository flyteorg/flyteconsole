import { IconButton, Tooltip } from '@material-ui/core';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';
import InputsAndOutputsIcon from '@material-ui/icons/Tv';
import { RerunIcon } from 'components/common/Icons/RerunIcon';
import { Identifier, ResourceIdentifier } from 'models/Common/types';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { TaskInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { literalsToLiteralValueMap } from 'components/Launch/LaunchForm/utils';
import { NodeExecutionsTableState } from './types';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionDetails } from '../types';
import t from './strings';

export const NodeExecutionActions: React.FC<{
  className?: string;
  execution: NodeExecution;
  state: NodeExecutionsTableState;
}> = ({ className, execution, state }) => {
  const detailsContext = useNodeExecutionContext();
  const [showLaunchForm, setShowLaunchForm] = React.useState<boolean>(false);
  const [nodeExecutionDetails, setNodeExecutionDetails] = React.useState<
    NodeExecutionDetails | undefined
  >();

  const executionData = useNodeExecutionData(execution.id);

  // open the side panel for selected execution's detail
  const inputsAndOutputsIconOnClick = (e: React.MouseEvent<HTMLElement>) => {
    // prevent the parent row body onClick event trigger
    e.stopPropagation();
    // use null in case if there is no execution provided - when it is null will close panel
    state.setSelectedExecution(execution?.id ?? null);
  };

  const rerunIconOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowLaunchForm(true);
  };

  React.useEffect(() => {
    detailsContext.getNodeExecutionDetails(execution).then((res) => {
      setNodeExecutionDetails(res);
    });
  });

  const literals = executionData.value.fullInputs?.literals;
  const id = nodeExecutionDetails?.taskTemplate?.id as ResourceIdentifier | undefined;

  const initialParameters: TaskInitialLaunchParameters = {
    values: literals && literalsToLiteralValueMap(literals),
    taskId: id as Identifier | undefined,
  };

  return (
    <>
      <div>
        <Tooltip title={t('inputsAndOutputsTooltip')}>
          <IconButton onClick={inputsAndOutputsIconOnClick}>
            <InputsAndOutputsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('rerunTooltip')}>
          <IconButton onClick={rerunIconOnClick}>
            <RerunIcon />
          </IconButton>
        </Tooltip>
      </div>
      {id && (
        <LaunchFormDialog
          id={id}
          initialParameters={initialParameters}
          showLaunchForm={showLaunchForm}
          setShowLaunchForm={setShowLaunchForm}
        />
      )}
    </>
  );
};
