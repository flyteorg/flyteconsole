import {
    TaskExecution,
    NodeExecution,
    Execution,
    Task,
    Workflow,
    LaunchPlan
} from 'models';

export interface MockTaskExecutionData {
    data: TaskExecution;
    nodeExecutions?: Record<string, MockNodeExecutionData>;
}

export interface MockNodeExecutionData {
    data: NodeExecution;
    nodeExecutions?: Record<string, MockNodeExecutionData>;
    taskExecutions?: Record<string, MockTaskExecutionData>;
}

export interface MockWorkflowExecutionData {
    data: Execution;
    nodeExecutions: Record<string, MockNodeExecutionData>;
}

export interface MockDataFixture {
    launchPlans?: Record<string, LaunchPlan>;
    tasks?: Record<string, Task>;
    workflows?: Record<string, Workflow>;
    workflowExecutions?: Record<string, MockWorkflowExecutionData>;
}
