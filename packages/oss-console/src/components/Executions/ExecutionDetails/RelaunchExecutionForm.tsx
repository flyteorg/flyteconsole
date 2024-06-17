import * as React from 'react';
import { WaitForData } from '../../common/WaitForData';
import { useAPIContext } from '../../data/apiContext';
import { fetchStates } from '../../hooks/types';
import { useFetchableData } from '../../hooks/useFetchableData';
import { LaunchForm } from '../../Launch/LaunchForm/LaunchForm';
import {
  TaskInitialLaunchParameters,
  WorkflowInitialLaunchParameters,
} from '../../Launch/LaunchForm/types';
import { fetchAndMapExecutionInputValues } from '../../Launch/LaunchForm/useMappedExecutionInputValues';
import { getTaskInputs, getWorkflowInputs } from '../../Launch/LaunchForm/utils';
import { Execution } from '../../../models/Execution/types';
import { isSingleTaskExecution } from './utils';

export interface RelaunchExecutionFormProps {
  execution: Execution;
  onClose(): void;
}

function useRelaunchWorkflowFormState({ execution }: RelaunchExecutionFormProps) {
  const apiContext = useAPIContext();
  const initialParameters = useFetchableData<WorkflowInitialLaunchParameters, Execution>(
    {
      defaultValue: {} as WorkflowInitialLaunchParameters,
      doFetch: async (execution) => {
        const {
          closure: { workflowId },
          spec: {
            launchPlan,
            disableAll,
            maxParallelism,
            rawOutputDataConfig,
            labels,
            annotations,
            authRole,
            securityContext,
            interruptible,
            overwriteCache,
            clusterAssignment
          },
        } = execution;

        const workflow = await apiContext.getWorkflow(workflowId);
        const inputDefinitions = getWorkflowInputs(workflow);
        const values = await fetchAndMapExecutionInputValues(
          {
            execution,
            inputDefinitions,
          },
          apiContext,
        );

        return {
          values,
          launchPlan,
          workflowId,
          disableAll,
          maxParallelism,
          rawOutputDataConfig,
          labels,
          annotations,
          authRole,
          securityContext,
          interruptible,
          overwriteCache,
          clusterAssignment
        };
      },
    },
    execution,
  );
  return { initialParameters };
}

function useRelaunchTaskFormState({ execution }: RelaunchExecutionFormProps) {
  const apiContext = useAPIContext();
  const initialParameters = useFetchableData<TaskInitialLaunchParameters, Execution>(
    {
      defaultValue: {} as TaskInitialLaunchParameters,
      doFetch: async (execution) => {
        const {
          spec: { authRole, launchPlan: taskId, interruptible, overwriteCache, clusterAssignment },
        } = execution;
        const task = await apiContext.getTask(taskId);
        const inputDefinitions = getTaskInputs(task);
        const values = await fetchAndMapExecutionInputValues(
          {
            execution,
            inputDefinitions,
          },
          apiContext,
        );
        return { authRole, values, taskId, interruptible, overwriteCache, clusterAssignment };
      },
    },
    execution,
  );
  return { initialParameters };
}

const RelaunchTaskForm: React.FC<RelaunchExecutionFormProps> = (props) => {
  const { initialParameters } = useRelaunchTaskFormState(props);
  const taskId = props.execution?.spec?.launchPlan;
  return (
    <WaitForData {...initialParameters}>
      {initialParameters.state.matches(fetchStates.LOADED) ? (
        <LaunchForm
          initialParameters={initialParameters.value}
          onClose={props.onClose}
          referenceExecutionId={props.execution.id}
          taskId={taskId}
        />
      ) : null}
    </WaitForData>
  );
};
const RelaunchWorkflowForm: React.FC<RelaunchExecutionFormProps> = (props) => {
  const { initialParameters } = useRelaunchWorkflowFormState(props);
  const {
    closure: { workflowId },
    spec: { securityContext },
  } = props.execution;

  return (
    <WaitForData {...initialParameters}>
      {initialParameters.state.matches(fetchStates.LOADED) ? (
        <LaunchForm
          initialParameters={initialParameters.value}
          onClose={props.onClose}
          referenceExecutionId={props.execution.id}
          workflowId={workflowId}
          securityContext={securityContext}
        />
      ) : null}
    </WaitForData>
  );
};

/** For a given execution, fetches the associated Workflow/Task and renders a
 * `LaunchForm` based on the same source with input values taken from the execution. */
export const RelaunchExecutionForm: React.FC<RelaunchExecutionFormProps> = (props) => {
  return isSingleTaskExecution(props.execution) ? (
    <RelaunchTaskForm {...props} />
  ) : (
    <RelaunchWorkflowForm {...props} />
  );
};
