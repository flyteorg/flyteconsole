import { MockServer } from 'mocks/server';
import { nodeExecutionQueryParams } from 'models';
import {
    MockDataFixture,
    MockNodeExecutionData,
    MockTaskExecutionData,
    MockWorkflowExecutionData
} from './fixtures/types';

function insertTaskExecutionData(
    server: MockServer,
    { data, nodeExecutions }: MockTaskExecutionData
): void {
    server.insertTaskExecution(data);
    if (nodeExecutions) {
        nodeExecutions.forEach(ne => insertNodeExecutionData(server, ne));
        server.insertTaskExecutionChildList(
            data.id,
            nodeExecutions.map(({ data }) => data)
        );
    }
}

function insertNodeExecutionData(
    server: MockServer,
    { data, taskExecutions, nodeExecutions }: MockNodeExecutionData
): void {
    server.insertNodeExecution(data);
    if (taskExecutions) {
        taskExecutions.forEach(te => insertTaskExecutionData(server, te));
        server.insertTaskExecutionList(
            data.id,
            taskExecutions.map(({ data }) => data)
        );
    }

    if (nodeExecutions) {
        nodeExecutions.forEach(ne => insertNodeExecutionData(server, ne));
        server.insertNodeExecutionList(
            data.id.executionId,
            nodeExecutions.map(({ data }) => data),
            { [nodeExecutionQueryParams.parentNodeId]: data.id.nodeId }
        );
    }
}

function insertWorkflowExecutionData(
    server: MockServer,
    { data, nodeExecutions }: MockWorkflowExecutionData
): void {
    server.insertWorkflowExecution(data);
    nodeExecutions.forEach(ne => insertNodeExecutionData(server, ne));
    server.insertNodeExecutionList(
        data.id,
        nodeExecutions.map(({ data }) => data)
    );
}

export function insertFixture(
    server: MockServer,
    { launchPlans, tasks, workflowExecutions, workflows }: MockDataFixture
): void {
    tasks?.forEach(server.insertTask);
    workflows?.forEach(server.insertWorkflow);
    workflowExecutions?.forEach(execution =>
        insertWorkflowExecutionData(server, execution)
    );
}
