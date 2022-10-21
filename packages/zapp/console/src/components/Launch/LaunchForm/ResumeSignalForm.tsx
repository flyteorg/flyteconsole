import { DialogContent, Typography } from '@material-ui/core';
import { getCacheKey } from 'components/Cache/utils';
import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { NodeExecution } from 'models/Execution/types';
import { NodeExecutionsByIdContext } from 'components/Executions/contexts';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { LiteralMapViewer } from 'components/Literals/LiteralMapViewer';
import { WaitForData } from 'components/common/WaitForData';
import t from 'components/common/strings';
import { useStyles } from './styles';
import { BaseInterpretedLaunchState, BaseLaunchService, ResumeSignalFormProps } from './types';
import { ResumeFormHeader } from './ResumeFormHeader';
import { ResumeFormActions } from './ResumeFormActions';
import { useResumeFormState } from './useResumeFormState';
import { LaunchFormInputs } from './LaunchFormInputs';

/** Renders the form for initiating a Launch request based on a Task */
export const ResumeSignalForm: React.FC<ResumeSignalFormProps> = (props) => {
  const { nodeExecutionId } = props;
  const { formInputsRef, state, service } = useResumeFormState(props);
  const nodeExecutionsById = useContext(NodeExecutionsByIdContext);
  const [nodeExecution, setNodeExecution] = useState<NodeExecution>(
    nodeExecutionsById[nodeExecutionId.nodeId],
  );
  const styles = useStyles();
  const baseState = state as BaseInterpretedLaunchState;
  const baseService = service as BaseLaunchService;
  const [isError, setIsError] = React.useState<boolean>(false);
  const executionData = useNodeExecutionData(nodeExecution.id);

  // Any time the inputs change (even if it's just re-ordering), we must
  // change the form key so that the inputs component will re-mount.
  const formKey = React.useMemo<string>(() => {
    return getCacheKey(state.context.parsedInputs);
  }, [state.context.parsedInputs]);

  useEffect(() => {
    const newNodeExecution = nodeExecutionsById[nodeExecutionId.nodeId];
    setNodeExecution(newNodeExecution);
  }, [nodeExecutionId]);

  return (
    <>
      <ResumeFormHeader title={nodeExecution.id.nodeId} />
      <DialogContent dividers={true} className={styles.inputsSection}>
        <LaunchFormInputs
          key={formKey}
          ref={formInputsRef}
          state={baseState}
          variant="task"
          setIsError={setIsError}
        />
        <Typography variant="h6">{t('gateNodeInput')}</Typography>
        <WaitForData {...executionData}>
          <LiteralMapViewer map={executionData.value.fullInputs} />
        </WaitForData>
      </DialogContent>
      <ResumeFormActions
        state={baseState}
        service={baseService}
        onClose={props.onClose}
        isError={isError}
      />
    </>
  );
};
