import { RequestHandlersList } from 'msw/lib/types/setupWorker/glossary';
import { nodeExecutionLists, nodeExecutions } from './data/nodeExecutions';
import { projects } from './data/projects';
import { taskExecutionChildLists, taskExecutionLists, taskExecutions } from './data/taskExecutions';
import { tasks } from './data/tasks';
import { workflowExecutions } from './data/workflowExecutions';
import { workflows } from './data/workflows';
import {
    nodeExecutionHandler,
    nodeExecutionListHandler,
    projectListHandler,
    taskExecutionChildListHandler,
    taskExecutionHandler,
    taskExecutionListHandler,
    taskHandler,
    workflowExecutionHandler,
    workflowHandler
} from './handlers';

export function getDefaultData(): RequestHandlersList {
    const projectListHandlers = [projectListHandler([projects.flyteTest])];

    const taskHandlers = Object.values(tasks).map(taskHandler);
    const workflowHandlers = Object.values(workflows).map(workflowHandler);

    const workflowExecutionHandlers = Object.values(workflowExecutions).map(
        workflowExecutionHandler
    );

    const nodeExecutionHandlers = Object.values(nodeExecutions).map(
        nodeExecutionHandler
    );
    const nodeExecutionListHandlers = nodeExecutionLists.map(([id, children]) =>
        nodeExecutionListHandler(id, children)
    );

    const taskExecutionHandlers = Object.values(taskExecutions).map(
        taskExecutionHandler
    );

    const taskExecutionListHandlers = taskExecutionLists.map(([id, children]) =>
        taskExecutionListHandler(id, children)
    );

    const taskExecutionChildListHandlers = taskExecutionChildLists.map(([id, children]) => taskExecutionChildListHandler(id, children));

    return [
        ...projectListHandlers,
        ...workflowHandlers,
        ...taskHandlers,
        ...workflowExecutionHandlers,
        ...nodeExecutionHandlers,
        ...nodeExecutionListHandlers,
        ...taskExecutionHandlers,
        ...taskExecutionListHandlers,
        ...taskExecutionChildListHandlers
    ];
}
