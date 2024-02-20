import React, { FC, useMemo, useState } from 'react';
import { dNode } from '@clients/oss-console/models/Graph/types';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useNodeExecutionDataQuery } from '@clients/oss-console/components/hooks/useNodeExecutionDataQuery';
import { TaskInitialLaunchParameters } from '@clients/oss-console/components/Launch/LaunchForm/types';
import { literalsToLiteralValueMap } from '@clients/oss-console/components/Launch/LaunchForm/utils';
import RerunIcon from '@clients/ui-atoms/RerunIcon';
import { ResourceIdentifier } from '@clients/oss-console/models/Common/types';
import { WaitForQuery } from '@clients/oss-console/components/common/WaitForQuery';
import t from '../strings';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { LaunchFormDialog } from '../../../Launch/LaunchForm/LaunchFormDialog';

export interface RerunButtonProps {
  node: dNode;
}
export const RerunButton: FC<RerunButtonProps> = ({ node }) => {
  const [showLaunchForm, setShowLaunchForm] = useState<boolean>(false);

  const { nodeExecutionsById } = useNodeExecutionsById();

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId!],
    [nodeExecutionsById[node?.scopedId!]],
  );
  const executionDataQuery = useNodeExecutionDataQuery({
    id: nodeExecution.id,
    enabled: showLaunchForm,
  });

  const rerunIconOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowLaunchForm(true);
  };
  const { nodeExecutionInfo, taskTemplateId } = useMemo(() => {
    const nodeExecutionInfo = node?.nodeExecutionInfo;
    const taskTemplateId = nodeExecutionInfo?.taskTemplate?.id;
    return {
      nodeExecutionInfo,
      taskTemplateId,
    };
  }, [node?.nodeExecutionInfo]);

  return taskTemplateId && !nodeExecution.dynamicParentNodeId ? (
    <>
      <Tooltip title={t('rerunTooltip')}>
        <IconButton onClick={rerunIconOnClick} size="large">
          <RerunIcon />
        </IconButton>
      </Tooltip>
      <WaitForQuery query={executionDataQuery}>
        {(executionData) => {
          const literals = executionData?.fullInputs?.literals;
          const taskInputsTypes = nodeExecutionInfo?.taskTemplate?.interface?.inputs?.variables;
          const initialParameters: TaskInitialLaunchParameters = {
            values:
              literals && taskInputsTypes && literalsToLiteralValueMap(literals, taskInputsTypes),
            taskId: taskTemplateId,
          };

          return (
            <LaunchFormDialog
              id={taskTemplateId as ResourceIdentifier}
              initialParameters={initialParameters}
              showLaunchForm={showLaunchForm}
              setShowLaunchForm={setShowLaunchForm}
            />
          );
        }}
      </WaitForQuery>
    </>
  ) : null;
};
