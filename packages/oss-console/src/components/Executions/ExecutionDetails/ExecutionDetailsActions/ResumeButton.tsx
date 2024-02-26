import React, { FC, useState } from 'react';
import Button from '@mui/material/Button';
import { literalsToLiteralValueMap } from '../../../Launch/LaunchForm/utils';
import { LaunchFormDialog } from '../../../Launch/LaunchForm/LaunchFormDialog';
import { extractCompiledNodes } from '../../../hooks/utils';
import t from '../strings';
import { WorkflowNodeExecution } from '../../contexts';
import { useEscapeKey } from '../../../hooks/useKeyListener';
import { useNodeExecutionDataQuery } from '../../../hooks/useNodeExecutionDataQuery';
import { NodeExecutionDetails } from '../../types';
import { WaitForQuery } from '../../../common/WaitForQuery';
import { TaskInitialLaunchParameters } from '../../../Launch/LaunchForm/types';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { useNodeExecutionContext } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';

export interface ResumeButtonProps {
  nodeExecution: WorkflowNodeExecution;
  nodeExecutionDetails?: NodeExecutionDetails;
  phase: NodeExecutionPhase;

  text?: string;
}
export const ResumeButton: FC<ResumeButtonProps> = ({
  phase,
  nodeExecution,
  nodeExecutionDetails,
  text,
}) => {
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const [showResumeForm, setShowResumeForm] = useState<boolean>(false);

  const compiledNode = extractCompiledNodes(compiledWorkflowClosure).find(
    (node) =>
      node.id === nodeExecution?.metadata?.specNodeId || node.id === nodeExecution.id.nodeId,
  );
  const executionDataQuery = useNodeExecutionDataQuery({
    id: nodeExecution.id,
  });
  useEscapeKey(() => {
    setShowResumeForm(false);
  });

  const onResumeClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowResumeForm(true);
  };
  const taskTemplateId = nodeExecutionDetails?.taskTemplate?.id;

  return taskTemplateId ? (
    <>
      {phase === NodeExecutionPhase.PAUSED && (
        <Button variant="outlined" color="primary" onClick={onResumeClick}>
          {text || t('resume')}
        </Button>
      )}
      <WaitForQuery query={executionDataQuery}>
        {(executionData) => {
          const literals = executionData?.fullInputs?.literals;
          const taskInputsTypes = nodeExecutionDetails?.taskTemplate?.interface?.inputs?.variables;
          const initialParameters = taskTemplateId
            ? ({
                values:
                  literals &&
                  taskInputsTypes &&
                  literalsToLiteralValueMap(literals, taskInputsTypes),
                taskId: taskTemplateId,
              } as TaskInitialLaunchParameters)
            : undefined;

          return (
            compiledNode && (
              <LaunchFormDialog
                compiledNode={compiledNode}
                initialParameters={initialParameters}
                nodeExecutionId={nodeExecution.id}
                showLaunchForm={showResumeForm}
                setShowLaunchForm={setShowResumeForm}
              />
            )
          );
        }}
      </WaitForQuery>
    </>
  ) : null;
};
