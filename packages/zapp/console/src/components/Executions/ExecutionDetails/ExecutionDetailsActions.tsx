import { Button } from '@material-ui/core';
import * as React from 'react';
import { ResourceIdentifier, Identifier } from 'models/Common/types';
import { getTask } from 'models/Task/api';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { literalsToLiteralValueMap } from 'components/Launch/LaunchForm/utils';
import { TaskInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { NodeExecutionDetails } from '../types';
import t from './strings';

interface ExecutionDetailsActionsProps {
  className?: string;
  details: NodeExecutionDetails;
  nodeExecutionId: NodeExecutionIdentifier;
}

export const ExecutionDetailsActions = (props: ExecutionDetailsActionsProps): JSX.Element => {
  const { className, details, nodeExecutionId } = props;

  const [showLaunchForm, setShowLaunchForm] = React.useState<boolean>(false);

  const [initialParameters, setInitialParameters] = React.useState<
    TaskInitialLaunchParameters | undefined
  >(undefined);

  const executionData = useNodeExecutionData(nodeExecutionId);
  const id = details.taskTemplate?.id;

  React.useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      const task = await getTask(id!);

      const literals = executionData.value.fullInputs?.literals;
      const taskInputsTypes = task.closure.compiledTask.template?.interface?.inputs?.variables;

      const tempInitialParameters: TaskInitialLaunchParameters = {
        values: literals && taskInputsTypes && literalsToLiteralValueMap(literals, taskInputsTypes),
        taskId: id as Identifier | undefined,
      };

      setInitialParameters(tempInitialParameters);
    })();
  }, [details]);

  if (!id || !initialParameters) {
    return <></>;
  }

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
      <LaunchFormDialog
        id={id as ResourceIdentifier}
        initialParameters={initialParameters}
        showLaunchForm={showLaunchForm}
        setShowLaunchForm={setShowLaunchForm}
      />
    </>
  );
};
