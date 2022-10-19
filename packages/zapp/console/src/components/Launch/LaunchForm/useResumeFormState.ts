import { useMachine } from '@xstate/react';
import { defaultStateMachineConfig } from 'components/common/constants';
import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { partial } from 'lodash';
import { RefObject, useMemo, useRef } from 'react';
import {
  TaskResumeContext,
  TaskResumeEvent,
  TaskResumeTypestate,
  taskResumeMachine,
} from './launchMachine';
import { validate as baseValidate } from './services';
import {
  InputType,
  LaunchFormInputsRef,
  ParsedInput,
  ResumeFormProps,
  ResumeFormState,
} from './types';
import { getUnsupportedRequiredInputs } from './utils';

async function loadInputs({ compiledNode }: TaskResumeContext) {
  if (!compiledNode) {
    throw new Error('Failed to load inputs: missing compiledNode');
  }
  const signalType = compiledNode.gateNode?.signal?.type;
  if (!signalType) {
    throw new Error('Failed to load inputs: missing signal.type');
  }
  const parsedInputs: ParsedInput[] = [
    {
      description: '',
      label: '',
      name: '',
      required: true,
      typeDefinition: {
        type: InputType.Boolean,
        literalType: {
          simple: signalType.simple ?? undefined,
        },
      },
    },
  ];

  return {
    parsedInputs,
    unsupportedRequiredInputs: getUnsupportedRequiredInputs(parsedInputs),
  };
}

async function validate(formInputsRef: RefObject<LaunchFormInputsRef>) {
  return baseValidate(formInputsRef);
}

async function submit(
  { createWorkflowExecution }: APIContextValue,
  formInputsRef: RefObject<LaunchFormInputsRef>,
  { compiledNode }: TaskResumeContext,
) {
  return '';
  /*
  if (!taskVersion) {
    throw new Error('Attempting to launch with no Task version');
  }
  if (formInputsRef.current === null) {
    throw new Error('Unexpected empty form inputs ref');
  }
  if (roleInputRef.current === null) {
    throw new Error('Unexpected empty role input ref');
  }

  const { securityContext } = roleInputRef.current?.getValue();
  const literals = formInputsRef.current.getValues();
  const interruptible = interruptibleInputRef.current?.getValue();
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
  });
  const newExecutionId = response.id as WorkflowExecutionIdentifier;
  if (!newExecutionId) {
    throw new Error('API Response did not include new execution id');
  }

  return newExecutionId;
  */
}

function getServices(apiContext: APIContextValue, formInputsRef: RefObject<LaunchFormInputsRef>) {
  return {
    // loadTaskVersions: partial(loadTaskVersions, apiContext),
    loadInputs: partial(loadInputs),
    submit: partial(submit, apiContext, formInputsRef),
    validate: partial(validate, formInputsRef),
  };
}

/** Contains all of the form state for a LaunchTaskForm, including input
 * definitions, current input values, and errors.
 */
export function useResumeFormState({ compiledNode }: ResumeFormProps): ResumeFormState {
  const apiContext = useAPIContext();
  const formInputsRef = useRef<LaunchFormInputsRef>(null);

  const services = useMemo(
    () => getServices(apiContext, formInputsRef),
    [apiContext, formInputsRef],
  );

  const [state, sendEvent, service] = useMachine<
    TaskResumeContext,
    TaskResumeEvent,
    TaskResumeTypestate
  >(taskResumeMachine, {
    ...defaultStateMachineConfig,
    services,
    context: {
      compiledNode,
    },
  });

  return {
    formInputsRef,
    state,
    service,
  };
}
