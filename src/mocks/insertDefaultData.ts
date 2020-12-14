import { dynamicExternalSubWorkflow } from './data/fixtures/dynamicExternalSubworkflow';
import { insertFixture } from './data/insertFixture';
import { nodeExecutionLists, nodeExecutions } from './data/nodeExecutions';
import { projects } from './data/projects';
import { taskExecutionChildLists, taskExecutionLists, taskExecutions } from './data/taskExecutions';
import { tasks } from './data/tasks';
import { workflowExecutions } from './data/workflowExecutions';
import { workflows } from './data/workflows';
import { MockServer } from './server';

export function insertDefaultData(server: MockServer): void {
    server.insertProjects([projects.flyteTest]);
    Object.values(tasks).forEach(server.insertTask);
    Object.values(workflows).forEach(server.insertWorkflow);

    Object.values(workflowExecutions).forEach(
        server.insertWorkflowExecution
    );

    Object.values(nodeExecutions).forEach(
        server.insertNodeExecution
    );
    nodeExecutionLists.forEach(([id, children]) =>
        server.insertNodeExecutionList(id, children)
    );

    Object.values(taskExecutions).forEach(
        server.insertTaskExecution
    );

    taskExecutionLists.forEach(([id, children]) =>
       server.insertTaskExecutionList(id, children)
    );

    taskExecutionChildLists.forEach(([id, children]) => server.insertTaskExecutionChildList(id, children));

    insertFixture(server, dynamicExternalSubWorkflow.generate());
}
