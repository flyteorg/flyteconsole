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
    nodeExecutions?: MockNodeExecutionData[];
}

export interface MockNodeExecutionData {
    data: NodeExecution;
    nodeExecutions?: MockNodeExecutionData[];
    taskExecutions?: MockTaskExecutionData[];
}

export interface MockWorkflowExecutionData {
    data: Execution;
    nodeExecutions: MockNodeExecutionData[];
}

export interface MockDataFixture {
    launchPlans?: LaunchPlan[];
    tasks?: Task[];
    workflows?: Workflow[];
    workflowExecutions?: MockWorkflowExecutionData[];
}
