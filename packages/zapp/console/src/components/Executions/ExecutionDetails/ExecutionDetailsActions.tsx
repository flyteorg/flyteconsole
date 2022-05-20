import { Button } from '@material-ui/core';
import * as React from 'react';
import { ResourceIdentifier, Identifier } from 'models/Common/types';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { literalsToLiteralValueMap } from 'components/Launch/LaunchForm/utils';
import { TaskInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { NodeExecutionDetails } from '../types';
import t from './strings';

export const ExecutionDetailsActions: React.FC<{
  className?: string;
  details: NodeExecutionDetails;
  nodeExecutionId: NodeExecutionIdentifier;
}> = ({ className, details, nodeExecutionId }) => {
  const [showLaunchForm, setShowLaunchForm] = React.useState<boolean>(false);
  const executionData = useNodeExecutionData(nodeExecutionId);

  const id = details.taskTemplate?.id as ResourceIdentifier | undefined;

  const literals = executionData.value.fullInputs?.literals;

  const initialParameters: TaskInitialLaunchParameters = {
    values: literals && literalsToLiteralValueMap(literals),
    taskId: id as Identifier | undefined,
  };

  const rerunOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowLaunchForm(true);
  };

  return (
    <>
      <div className={className}>
        <Button variant="outlined" color="primary" onClick={rerunOnClick}>
          {t('rerun')}
        </Button>
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
