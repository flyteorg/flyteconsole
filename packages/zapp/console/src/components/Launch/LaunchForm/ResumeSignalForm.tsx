import { DialogContent } from '@material-ui/core';
import { getCacheKey } from 'components/Cache/utils';
import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { NodeExecution } from 'models/Execution/types';
import { NodeExecutionsByIdContext } from 'components/Executions/contexts';
import { useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { LiteralMapViewer } from 'components/Literals/LiteralMapViewer';
import { WaitForData } from 'components/common/WaitForData';
import { useStyles } from './styles';
import { BaseInterpretedLaunchState, BaseLaunchService, ResumeSignalFormProps } from './types';
import { useLaunchTaskFormState } from './useLaunchTaskFormState';
import { ResumeFormHeader } from './ResumeFormHeader';
import { ResumeFormInputs } from './ResumeFormInputs';
import { ResumeFormActions } from './ResumeFormActions';

/** Renders the form for initiating a Launch request based on a Task */
export const ResumeSignalForm: React.FC<ResumeSignalFormProps> = (props) => {
  const { formInputsRef, state, service } = useLaunchTaskFormState(props);
  const nodeExecutionsById = useContext(NodeExecutionsByIdContext);
  const [nodeExecution, setNodeExecution] = useState<NodeExecution>(
    nodeExecutionsById[props.nodeExecutionId.nodeId],
  );
  const styles = useStyles();
  const baseState = state as BaseInterpretedLaunchState;
  const baseService = service as BaseLaunchService;
  const [isError, setIsError] = React.useState<boolean>(false);
  const executionData = useNodeExecutionData(nodeExecution.id);

  useEffect(() => {
    const newNodeExecution = nodeExecutionsById[props.nodeExecutionId.nodeId];
    setNodeExecution(newNodeExecution);
  }, [props.nodeExecutionId]);

  // Any time the inputs change (even if it's just re-ordering), we must
  // change the form key so that the inputs component will re-mount.
  const formKey = React.useMemo<string>(() => {
    return getCacheKey(state.context.parsedInputs);
  }, [state.context.parsedInputs]);

  // TODO: We removed all loading indicators here. Decide if we want skeletons
  // instead.
  // https://github.com/flyteorg/flyteconsole/issues/422

  return (
    <>
      <ResumeFormHeader title={state.context.sourceId?.name} />
      <DialogContent dividers={true} className={styles.inputsSection}>
        <ResumeFormInputs
          key={formKey}
          ref={formInputsRef}
          state={baseState}
          variant="task"
          setIsError={setIsError}
        />
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
