import { dateToTimestamp, millisecondsToDuration } from 'common/utils';
import { Admin } from 'flyteidl';
import { LiteralMap } from 'models/Common/types';
import { WorkflowExecutionPhase } from 'models/Execution/enums';
import { Execution, ExecutionMetadata } from 'models/Execution/types';
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
