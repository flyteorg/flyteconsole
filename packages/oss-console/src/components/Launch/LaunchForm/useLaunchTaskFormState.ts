import { useMachine } from '@xstate/react';
import partial from 'lodash/partial';
import uniqBy from 'lodash/uniqBy';
import { RefObject, useEffect, useMemo, useRef } from 'react';
import { FilterOperationName, SortDirection } from '@clients/common/types/adminEntityTypes';
import { defaultStateMachineConfig } from '../../common/constants';
import { APIContextValue, useAPIContext } from '../../data/apiContext';
import { Identifier } from '../../../models/Common/types';
import { WorkflowExecutionIdentifier } from '../../../models/Execution/types';
import { taskSortFields } from '../../../models/Task/constants';
import { Task } from '../../../models/Task/types';
import { stringifyIsEqual } from '../../../common/stringifyIsEqual';
import t from './strings';
import { getInputsForTask } from './getInputs';
import {
  LaunchState,
  TaskLaunchContext,
  TaskLaunchContextExtended,
  TaskLaunchEvent,
  taskLaunchMachine,
  TaskLaunchTypestate,
} from './launchMachine';
import { validate as baseValidate } from './services';
import {
  LaunchExecutionClusterLabelInputRef, LaunchFormInputsRef,
  LaunchInterruptibleInputRef,
  LaunchOverwriteCacheInputRef,
  LaunchRoleInputRef,
  LaunchTaskFormProps,
  LaunchTaskFormState,
  ParsedInput,
} from './types';
import { useTaskSourceSelectorState } from './useTaskSourceSelectorState';
import { getUnsupportedRequiredInputs } from './utils';

async function loadTaskVersions(
  { listTasks }: APIContextValue,
  { preferredTaskId, sourceId }: TaskLaunchContext,
) {
  if (!sourceId) {
    throw new Error('Cannot load tasks, missing sourceId');
  }
  const { project, domain, name } = sourceId;
  const tasksPromise = listTasks(
    { project, domain, name },
    {
      limit: 10,
      sort: {
        key: taskSortFields.createdAt,
        direction: SortDirection.DESCENDING,
      },
    },
  );

  let preferredTaskPromise = Promise.resolve({
    entities: [] as Task[],
  });
  if (preferredTaskId) {
    const { version, ...scope } = preferredTaskId;
    preferredTaskPromise = listTasks(scope, {
      limit: 1,
      filter: [
        {
          key: 'version',
          operation: FilterOperationName.EQ,
          value: version,
        },
      ],
    });
  }

  const [tasksResult, preferredTaskResult] = await Promise.all([
    tasksPromise,
    preferredTaskPromise,
  ]);
  const merged = [...tasksResult.entities, ...preferredTaskResult.entities];
  return uniqBy(merged, ({ id: { version } }) => version);
}

async function loadInputs(
  { getTask }: APIContextValue,
  { defaultInputValues, taskVersion }: TaskLaunchContext,
) {
  if (!taskVersion) {
    throw new Error('Failed to load inputs: missing taskVersion');
  }

  const task = await getTask(taskVersion);
  const parsedInputs: ParsedInput[] = getInputsForTask(task, defaultInputValues);

  return {
    parsedInputs,
    unsupportedRequiredInputs: getUnsupportedRequiredInputs(parsedInputs),
  };
}

async function validate(
  formInputsRef: RefObject<LaunchFormInputsRef>,
  roleInputRef: RefObject<LaunchRoleInputRef>,
  _interruptibleInputRef: RefObject<LaunchInterruptibleInputRef>,
  _overwriteCacheInputRef: RefObject<LaunchOverwriteCacheInputRef>,
) {
  if (roleInputRef.current === null) {
    throw new Error('Unexpected empty role input ref');
  }

  if (!roleInputRef.current.validate()) {
    throw new Error(t('correctInputErrors'));
  }
  return baseValidate(formInputsRef);
}

async function submit(
  { createWorkflowExecution }: APIContextValue,
  formInputsRef: RefObject<LaunchFormInputsRef>,
  roleInputRef: RefObject<LaunchRoleInputRef>,
  interruptibleInputRef: RefObject<LaunchInterruptibleInputRef>,
  overwriteCacheInputRef: RefObject<LaunchOverwriteCacheInputRef>,
  executionClusterLabelInputRef: RefObject<LaunchExecutionClusterLabelInputRef>,
  { referenceExecutionId, taskVersion }: TaskLaunchContext,
) {
  if (!taskVersion) {
    throw new Error('Attempting to launch with no Task version');
  }
  if (formInputsRef.current === null) {
    throw new Error('Unexpected empty form inputs ref');
  }
  if (roleInputRef.current === null) {
    throw new Error('Unexpected empty role input ref');
  }

  const { securityContext } = roleInputRef?.current?.getValue?.() || {};
  const literals = formInputsRef.current.getValues();
  const interruptible = interruptibleInputRef.current?.getValue();
  const overwriteCache = overwriteCacheInputRef.current?.getValue();
  const executionClusterLabel = executionClusterLabelInputRef.current?.getValue();
  const launchPlanId = taskVersion;
  const { domain, project } = taskVersion;

  const response = await createWorkflowExecution({
    securityContext,
    domain,
    launchPlanId,
    project,
    referenceExecutionId,
    inputs: { literals },
    interruptible,
    overwriteCache,
    executionClusterLabel,
  });
  const newExecutionId = response.id as WorkflowExecutionIdentifier;
  if (!newExecutionId) {
    throw new Error('API Response did not include new execution id');
  }

  return newExecutionId;
}

function getServices(
  apiContext: APIContextValue,
  formInputsRef: RefObject<LaunchFormInputsRef>,
  roleInputRef: RefObject<LaunchRoleInputRef>,
  interruptibleInputRef: RefObject<LaunchInterruptibleInputRef>,
  overwriteCacheInputRef: RefObject<LaunchOverwriteCacheInputRef>,
  executionClusterLabelInputRef: RefObject<LaunchExecutionClusterLabelInputRef>,
) {
  return {
    loadTaskVersions: partial(loadTaskVersions, apiContext),
    loadInputs: partial(loadInputs, apiContext),
    submit: (launchContext: TaskLaunchContext) =>
      submit(
        apiContext,
        formInputsRef,
        roleInputRef,
        interruptibleInputRef,
        overwriteCacheInputRef,
        executionClusterLabelInputRef,
        launchContext,
      ),
    validate: partial(
      validate,
      formInputsRef,
      roleInputRef,
      interruptibleInputRef,
      overwriteCacheInputRef,
    ),
  };
}

/** Contains all of the form state for a LaunchTaskForm, including input
 * definitions, current input values, and errors.
 */
export function useLaunchTaskFormState({
  initialParameters = {},
  taskId: sourceId,
  referenceExecutionId,
}: LaunchTaskFormProps): LaunchTaskFormState {
  // These values will be used to auto-select items from the task
  // version/launch plan drop downs.
  const {
    authRole: defaultAuthRole,
    taskId: preferredTaskId,
    values: defaultInputValues,
    interruptible,
    overwriteCache,
    executionClusterLabel,
  } = initialParameters;

  const apiContext = useAPIContext();
  const formInputsRef = useRef<LaunchFormInputsRef>(null);
  const roleInputRef = useRef<LaunchRoleInputRef>(null);
  const interruptibleInputRef = useRef<LaunchInterruptibleInputRef>(null);
  const overwriteCacheInputRef = useRef<LaunchOverwriteCacheInputRef>(null);
  const executionClusterLabelInputRef =  useRef<LaunchExecutionClusterLabelInputRef>({
     getValue: () => executionClusterLabel,
     validate: () => true,
   });

  const services = useMemo(
    () =>
      getServices(
        apiContext,
        formInputsRef,
        roleInputRef,
        interruptibleInputRef,
        overwriteCacheInputRef,
        executionClusterLabelInputRef,
      ),
    [apiContext, formInputsRef, roleInputRef, interruptibleInputRef, overwriteCacheInputRef, executionClusterLabelInputRef],
  );

  const [state, sendEvent, service] = useMachine<
    TaskLaunchContext,
    TaskLaunchEvent,
    TaskLaunchTypestate
  >(taskLaunchMachine, {
    ...defaultStateMachineConfig,
    services,
    context: {
      defaultAuthRole,
      defaultInputValues,
      preferredTaskId,
      referenceExecutionId,
      sourceId,
      interruptible,
      overwriteCache,
      executionClusterLabel,
    },
  });

  const { taskVersionOptions = [], taskVersion } = state.context;

  const selectTaskVersion = (newTask: Identifier) => {
    if (newTask === taskVersion) {
      return;
    }
    sendEvent({
      type: 'SELECT_TASK_VERSION',
      taskId: newTask,
    });
  };

  const taskSourceSelectorState = useTaskSourceSelectorState({
    sourceId,
    selectTaskVersion,
    taskVersion,
    taskVersionOptions,
  });

  useEffect(() => {
    const subscription = service.subscribe((newState) => {
      if (newState.matches(LaunchState.SELECT_TASK_VERSION)) {
        const { taskVersionOptions, preferredTaskId } =
          newState.context as TaskLaunchContextExtended;
        if (taskVersionOptions.length > 0) {
          let taskToSelect = taskVersionOptions[0];
          if (preferredTaskId) {
            const preferred = taskVersionOptions.find(({ id }) =>
              stringifyIsEqual(id, preferredTaskId),
            );
            if (preferred) {
              taskToSelect = preferred;
            }
          }
          sendEvent({
            type: 'SELECT_TASK_VERSION',
            taskId: taskToSelect.id,
          });
        }
      }
    });

    return subscription.unsubscribe;
  }, [service, sendEvent]);

  return {
    formInputsRef,
    roleInputRef,
    interruptibleInputRef,
    overwriteCacheInputRef,
    executionClusterLabelInputRef,
    state,
    service,
    taskSourceSelectorState,
  };
}
