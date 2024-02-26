import React, { useState, useEffect, useMemo } from 'react';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { getCacheKey } from '../../Cache/utils';
import { NodeExecution, NodeExecutionIdentifier } from '../../../models/Execution/types';
import { useNodeExecutionDataQuery } from '../../hooks/useNodeExecutionDataQuery';
import { LiteralMapViewer } from '../../Literals/LiteralMapViewer';
import t from '../../common/strings';
import { CompiledNode } from '../../../models/Node/types';
import { useNodeExecutionsById } from '../../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { useStyles } from './styles';
import {
  BaseInterpretedLaunchState,
  BaseLaunchFormProps,
  BaseLaunchService,
  TaskInitialLaunchParameters,
} from './types';
import { useResumeFormState } from './useResumeFormState';
import { LaunchFormInputs } from './LaunchFormInputs';
import { LaunchFormHeader } from './LaunchFormHeader';
import launchFormStrings from './strings';
import { LaunchFormActions } from './LaunchFormActions';
import { WaitForQuery } from '../../common/WaitForQuery';

export interface ResumeSignalFormProps extends BaseLaunchFormProps {
  compiledNode: CompiledNode;
  initialParameters?: TaskInitialLaunchParameters;
  nodeExecutionId: NodeExecutionIdentifier;
}

/** Renders the form for requesting a resume request on a gate node */
export const ResumeSignalForm: React.FC<ResumeSignalFormProps> = ({
  compiledNode,
  nodeExecutionId,
  onClose,
}) => {
  const { formInputsRef, state, service } = useResumeFormState({
    compiledNode,
    nodeExecutionId,
    onClose,
  });
  const { nodeExecutionsById } = useNodeExecutionsById();
  const [nodeExecution, setNodeExecution] = useState<NodeExecution>(
    nodeExecutionsById[nodeExecutionId.nodeId],
  );
  const styles = useStyles();
  const baseState = state as BaseInterpretedLaunchState;
  const baseService = service as BaseLaunchService;
  const [isError, setIsError] = useState<boolean>(false);
  const nodeExecutionDataQuery = useNodeExecutionDataQuery({
    id: nodeExecution.id,
  });
  // Any time the inputs change (even if it's just re-ordering), we must
  // change the form key so that the inputs component will re-mount.
  const formKey = useMemo<string>(() => {
    return getCacheKey(state.context.parsedInputs);
  }, [state.context.parsedInputs]);

  useEffect(() => {
    const newNodeExecution = nodeExecutionsById[nodeExecutionId.nodeId];
    setNodeExecution(newNodeExecution);
  }, [nodeExecutionId.nodeId]);

  return (
    <>
      <LaunchFormHeader
        title={nodeExecution.id.nodeId}
        formTitle={launchFormStrings('resumeTitle')}
      />
      <DialogContent dividers sx={styles}>
        <LaunchFormInputs
          key={formKey}
          ref={formInputsRef}
          state={baseState}
          variant="task"
          setIsError={setIsError}
        />
        <Typography variant="h6">{t('gateNodeInput')}</Typography>
        <WaitForQuery query={nodeExecutionDataQuery}>
          {(data) => <LiteralMapViewer map={data?.fullInputs} />}
        </WaitForQuery>
      </DialogContent>
      <LaunchFormActions
        state={baseState}
        service={baseService}
        onClose={onClose}
        isError={isError}
        submitTitle={
          compiledNode.gateNode?.approve?.signalId
            ? launchFormStrings('approve')
            : launchFormStrings('resume')
        }
        rejectTitle={compiledNode.gateNode?.approve?.signalId ? launchFormStrings('reject') : null}
      />
    </>
  );
};
