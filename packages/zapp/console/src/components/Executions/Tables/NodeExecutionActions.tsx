import { IconButton } from '@material-ui/core';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';
import InputsAndOutputsIcon from '@material-ui/icons/Tv';
import RerunIcon from '@material-ui/icons/Autorenew';
import { ResourceIdentifier } from 'models/Common/types';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { NodeExecutionsTableState } from './types';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionDetails } from '../types';

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

  const id = nodeExecutionDetails?.taskTemplate?.id as ResourceIdentifier | undefined;

  return (
    <>
      <div>
        <IconButton onClick={inputsAndOutputsIconOnClick}>
          <InputsAndOutputsIcon />
        </IconButton>
        <IconButton onClick={rerunIconOnClick}>
          <RerunIcon />
        </IconButton>
      </div>
      {id && (
        <LaunchFormDialog
          id={id}
          showLaunchForm={showLaunchForm}
          setShowLaunchForm={setShowLaunchForm}
        />
      )}
    </>
  );
};
