import { WorkflowId } from 'models/Workflow/types';
import { WorkflowExecutionPhase } from 'models/Execution/enums';

export type WorkflowListItem = {
    id: WorkflowId;
    inputs?: string;
    outputs?: string;
    latestExecutionTime?: string;
    executionStatus?: WorkflowExecutionPhase[];
    description?: string;
};
