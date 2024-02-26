import React, { FC, useMemo, useState } from 'react';
import { dNode } from '@clients/oss-console/models/Graph/types';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useNodeExecutionDataQuery } from '@clients/oss-console/components/hooks/useNodeExecutionDataQuery';
import { literalsToLiteralValueMap } from '@clients/oss-console/components/Launch/LaunchForm/utils';
import { WaitForQuery } from '@clients/oss-console/components/common/WaitForQuery';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { getNodeFrontendPhase } from '../../utils';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import t from '../strings';
import { LaunchFormDialog } from '../../../Launch/LaunchForm/LaunchFormDialog';
import { NodeExecutionIdentifier } from '../../../../models/Execution/types';
import { TaskInitialLaunchParameters } from '../../../Launch/LaunchForm/types';
import { useEscapeKey } from '../../../hooks/useKeyListener';

export interface ResumeButtonProps {
  node: dNode;
}
export const ResumeButton: FC<ResumeButtonProps> = ({ node }) => {
  const [showResumeForm, setShowResumeForm] = useState<boolean>(false);
  const { nodeExecutionsById } = useNodeExecutionsById();

  useEscapeKey(() => {
    setShowResumeForm(false);
  });

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId!],
    [nodeExecutionsById[node?.scopedId!]],
  );

  const executionDataQuery = useNodeExecutionDataQuery({
    id: nodeExecution.id,
    enabled: showResumeForm,
  });

  const { nodeExecutionInfo, taskTemplateId, compiledNode, isGateNode } = useMemo(() => {
    const nodeExecutionInfo = node?.nodeExecutionInfo;
    const taskTemplateId = nodeExecutionInfo?.taskTemplate?.id;
    const compiledNode = node?.value;
    const isGateNode = !!compiledNode?.gateNode;
    return {
      nodeExecutionInfo,
      taskTemplateId,
      compiledNode,
      isGateNode,
    };
  }, [node?.value, node?.nodeExecutionInfo]);

  const nodeExecutionPhase = getNodeFrontendPhase(
    nodeExecution?.closure?.phase || NodeExecutionPhase.UNDEFINED,
    isGateNode,
  );

  const onResumeClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowResumeForm(true);
  };
  return nodeExecutionPhase === NodeExecutionPhase.PAUSED ? (
    <>
      <Tooltip title={t('resumeTooltip')}>
        <IconButton data-testid={t('resumeTooltip')} onClick={onResumeClick} size="large">
          <PlayCircleOutlineIcon />
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
          return compiledNode ? (
            <LaunchFormDialog
              compiledNode={compiledNode}
              initialParameters={initialParameters}
              nodeExecutionId={nodeExecution.id as NodeExecutionIdentifier}
              showLaunchForm={showResumeForm}
              setShowLaunchForm={setShowResumeForm}
            />
          ) : null;
        }}
      </WaitForQuery>
    </>
  ) : null;
};
