import { dateToTimestamp, millisecondsToDuration } from 'common/utils';
import { Admin } from 'flyteidl';
import { LaunchPlan } from 'models';
import { Identifier, LiteralMap } from 'models/Common/types';
import { WorkflowExecutionPhase } from 'models/Execution/enums';
import {
    Execution,
    ExecutionClosure,
    ExecutionMetadata,
    ExecutionSpec,
    WorkflowExecutionIdentifier
} from 'models/Execution/types';
import {
    defaultExecutionDuration,
    mockStartDate,
    testDomain,
    testProject
} from './constants';
import { launchPlans } from './launchPlans';
import { workflows } from './workflows';

export function defaultWorkflowExecutionMetadata(): ExecutionMetadata {
    return {
        mode: Admin.ExecutionMetadata.ExecutionMode.MANUAL,
        principal: 'sdk',
        nesting: 0
    };
}

export function emptyLiteralMap(): LiteralMap {
    return { literals: {} };
}

export interface WorkflowExecutionOverrides {
    spec?: Partial<ExecutionSpec>;
    closure?: Partial<ExecutionClosure>;
}
export function workflowExecution(
    id: WorkflowExecutionIdentifier,
    workflowId: Identifier,
    launchPlan: LaunchPlan,
    { closure, spec }: WorkflowExecutionOverrides = {}
): Execution {
    const executionStart = dateToTimestamp(mockStartDate);
    return {
        id: {
            ...id
        },
        spec: {
            launchPlan: { ...launchPlan.id },
            inputs: emptyLiteralMap(),
            metadata: defaultWorkflowExecutionMetadata(),
            notifications: {
                notifications: []
            },
            ...spec
        },
        closure: {
            computedInputs: emptyLiteralMap(),
            createdAt: executionStart,
            duration: millisecondsToDuration(defaultExecutionDuration),
            phase: WorkflowExecutionPhase.SUCCEEDED,
            startedAt: executionStart,
            workflowId: { ...workflowId },
            ...closure
        }
    };
}

// Note: Names here must be unique
export const workflowExecutionIds = {
    basic: {
        project: testProject,
        domain: testDomain,
        name: 'basicExecution'
    },
    nestedDynamic: {
        project: testProject,
        domain: testDomain,
        name: 'nestedDynamicExecution'
    }
};

const basic: Execution = {
    id: { ...workflowExecutionIds.basic },
    spec: {
        launchPlan: { ...launchPlans.basic.id },
        inputs: emptyLiteralMap(),
        metadata: defaultWorkflowExecutionMetadata(),
        notifications: {
            notifications: []
        }
    },
    closure: {
        computedInputs: emptyLiteralMap(),
        createdAt: dateToTimestamp(mockStartDate),
        duration: millisecondsToDuration(defaultExecutionDuration),
        phase: WorkflowExecutionPhase.SUCCEEDED,
        startedAt: dateToTimestamp(mockStartDate),
        workflowId: { ...workflows.basic.id }
    }
};

const nestedDynamic = {
    id: {
        ...workflowExecutionIds.nestedDynamic
    },
    spec: {
        launchPlan: { ...launchPlans.nestedDynamic.id },
        inputs: emptyLiteralMap(),
        metadata: defaultWorkflowExecutionMetadata(),
        notifications: {
            notifications: []
        }
    },
    closure: {
        computedInputs: emptyLiteralMap(),
        createdAt: dateToTimestamp(mockStartDate),
        duration: millisecondsToDuration(defaultExecutionDuration),
        phase: WorkflowExecutionPhase.SUCCEEDED,
        startedAt: dateToTimestamp(mockStartDate),
        workflowId: { ...workflows.nestedDynamic.id }
    }
};

export const workflowExecutions = {
    basic,
    nestedDynamic
};
