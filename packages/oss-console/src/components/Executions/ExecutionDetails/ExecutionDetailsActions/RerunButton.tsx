import React, { FC, useState } from 'react';
import Button from '@mui/material/Button';
import { literalsToLiteralValueMap } from '@clients/oss-console/components/Launch/LaunchForm/utils';
import { ResourceIdentifier } from '@clients/oss-console/models/Common/types';
import { LaunchFormDialog } from '@clients/oss-console/components/Launch/LaunchForm/LaunchFormDialog';
import t from '../strings';
import { WorkflowNodeExecution } from '../../contexts';
import { useEscapeKey } from '../../../hooks/useKeyListener';
import { useNodeExecutionDataQuery } from '../../../hooks/useNodeExecutionDataQuery';
import { NodeExecutionDetails } from '../../types';
import { WaitForQuery } from '../../../common/WaitForQuery';
import { TaskInitialLaunchParameters } from '../../../Launch/LaunchForm/types';

export interface RerunButtonProps {
  nodeExecution: WorkflowNodeExecution;
  nodeExecutionDetails?: NodeExecutionDetails;
  text?: string;
}
export const RerunButton: FC<RerunButtonProps> = ({
  nodeExecution,
  nodeExecutionDetails,
  text,
}) => {
  const [showLaunchForm, setShowLaunchForm] = useState<boolean>(false);
  const executionDataQuery = useNodeExecutionDataQuery({
    id: nodeExecution.id,
  });
  useEscapeKey(() => {
    setShowLaunchForm(false);
  });

  const rerunOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowLaunchForm(true);
  };

  const taskTemplateId = nodeExecutionDetails?.taskTemplate?.id;

  return taskTemplateId && !nodeExecution.dynamicParentNodeId ? (
    <>
      <Button variant="outlined" color="primary" onClick={rerunOnClick}>
        {text || t('rerun')}
      </Button>
      <WaitForQuery query={executionDataQuery}>
        {(executionData) => {
          const literals = executionData?.fullInputs?.literals;
          const taskInputsTypes = nodeExecutionDetails?.taskTemplate?.interface?.inputs?.variables;
          const initialParameters =
            literals && taskInputsTypes
              ? ({
                  values:
                    literals &&
                    taskInputsTypes &&
                    literalsToLiteralValueMap(literals, taskInputsTypes),
                  taskId: taskTemplateId,
                } as TaskInitialLaunchParameters)
              : undefined;
          return (
            <>
              <LaunchFormDialog
                id={taskTemplateId as ResourceIdentifier}
                initialParameters={initialParameters}
                showLaunchForm={showLaunchForm}
                setShowLaunchForm={setShowLaunchForm}
              />
            </>
          );
        }}
      </WaitForQuery>
    </>
  ) : null;
};
