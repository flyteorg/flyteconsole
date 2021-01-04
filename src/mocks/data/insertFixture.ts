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
    mock: MockTaskExecutionData
): void {
    server.insertTaskExecution(mock.data);
    if (mock.nodeExecutions) {
        const nodeExecutions = Object.values(mock.nodeExecutions);
        nodeExecutions.forEach(ne => insertNodeExecutionData(server, ne));
        server.insertTaskExecutionChildList(
            mock.data.id,
            nodeExecutions.map(({ data }) => data)
        );
    }
}

function insertNodeExecutionData(
    server: MockServer,
    mock: MockNodeExecutionData
): void {
    server.insertNodeExecution(mock.data);
    if (mock.taskExecutions) {
        const taskExecutions = Object.values(mock.taskExecutions);
        taskExecutions.forEach(te => insertTaskExecutionData(server, te));
        server.insertTaskExecutionList(
            mock.data.id,
            taskExecutions.map(({ data }) => data)
        );
    }

    if (mock.nodeExecutions) {
        const nodeExecutions = Object.values(mock.nodeExecutions);
        nodeExecutions.forEach(ne => insertNodeExecutionData(server, ne));
        server.insertNodeExecutionList(
            mock.data.id.executionId,
            nodeExecutions.map(({ data }) => data),
            { [nodeExecutionQueryParams.parentNodeId]: mock.data.id.nodeId }
        );
    }
}

function insertWorkflowExecutionData(
    server: MockServer,
    mock: MockWorkflowExecutionData
): void {
    server.insertWorkflowExecution(mock.data);
    const nodeExecutions = Object.values(mock.nodeExecutions);
    nodeExecutions.forEach(ne => insertNodeExecutionData(server, ne));
    server.insertNodeExecutionList(
        mock.data.id,
        nodeExecutions.map(({ data }) => data)
    );
}

/** Deep-inserts all entities from a generated `MockDataFixture`. */
export function insertFixture(
    server: MockServer,
    { launchPlans, tasks, workflowExecutions, workflows }: MockDataFixture
): void {
    // TODO: Insert Launch plans (requires support in mockServer)
    if (tasks) {
        Object.values(tasks).forEach(server.insertTask);
    }
    if (workflows) {
        Object.values(workflows).forEach(server.insertWorkflow);
    }
    if (workflowExecutions) {
        Object.values(workflowExecutions).forEach(execution =>
            insertWorkflowExecutionData(server, execution)
        );
    }
}
