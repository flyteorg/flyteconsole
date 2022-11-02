import {
  Core,
  Protobuf,
  LiteralMap,
  LiteralMapBlob,
  ExecutionMode,
  ExecutionState,
  WorkflowExecutionPhase,
  Execution,
  ExecutionClosure,
  ExecutionMetadata,
  ExecutionSpec,
} from '@flyteconsole/components';
import Long from 'long';

export const MOCK_LAUNCH_PLAN_ID = {
  resourceType: Core.ResourceType.LAUNCH_PLAN,
  project: 'project',
  domain: 'domain',
  name: 'name',
  version: 'version',
};

export const MOCK_WORKFLOW_ID = {
  resourceType: Core.ResourceType.WORKFLOW,
  project: 'project',
  domain: 'domain',
  name: 'name',
  version: 'version',
};

export function fixedDuration(): Protobuf.Duration {
  return {
    nanos: 0,
    seconds: Long.fromNumber(100),
  };
}

export function fixedTimestamp(): Protobuf.Timestamp {
  return {
    nanos: 0,
    seconds: Long.fromNumber(0),
  };
}

export function generateLiteralMapBlob(): LiteralMapBlob {
  return {
    uri: 'randomUri',
    values: {
      literals: {},
    },
  };
}

export function generateLiteralMap(): LiteralMap {
  return {
    literals: {},
  };
}

export function fixedPhase(): WorkflowExecutionPhase {
  return WorkflowExecutionPhase.SUCCEEDED;
}

export function stateActive(): ExecutionState {
  return ExecutionState.EXECUTION_ACTIVE;
}

export const createMockExecutionClosure: () => ExecutionClosure = () => ({
  computedInputs: generateLiteralMap(),
  createdAt: fixedTimestamp(),
  duration: fixedDuration(),
  outputs: generateLiteralMapBlob(),
  phase: fixedPhase(),
  startedAt: fixedTimestamp(),
  workflowId: { ...MOCK_WORKFLOW_ID },
  status: { state: stateActive() },
});

export function generateExecutionMetadata(): ExecutionMetadata {
  return {
    mode: ExecutionMode.MANUAL,
    nesting: 0,
    principal: 'human',
    systemMetadata: {
      executionCluster: 'flyte',
    },
  };
}

export const createMockExecutionSpec: () => ExecutionSpec = () => ({
  inputs: generateLiteralMap(),
  launchPlan: { ...MOCK_LAUNCH_PLAN_ID },
  notifications: { notifications: [] },
  metadata: generateExecutionMetadata(),
});

export const createMockExecution: (id?: string | number) => Execution = (id = 1) => {
  const executionId = `${id}`;
  const name = executionId;
  const project = 'project';
  const domain = 'domain';
  return {
    executionId,
    id: { project, domain, name },
    launchPlanId: { project, domain, name, version: '1' },
    closure: createMockExecutionClosure(),
    spec: createMockExecutionSpec(),
  };
};
