import { RequestHandlersList } from 'msw/lib/types/setupWorker/glossary';
import { nodeExecutionLists, nodeExecutions } from './data/nodeExecutions';
import { workflowExecutions } from './data/workflowExecutions';
import {
    nodeExecutionHandler,
    nodeExecutionListHandler,
    workflowExecutionHandler
} from './handlers';

export function getDefaultData(): RequestHandlersList {
    const workflowExecutionHandlers = Object.values(workflowExecutions).map(
        workflowExecutionHandler
    );

    const nodeExecutionHandlers = Object.values(nodeExecutions).map(
        nodeExecutionHandler
    );
    const nodeExecutionListHandlers = nodeExecutionLists.map(([id, children]) =>
        nodeExecutionListHandler(id, children)
    );
    return [
        ...workflowExecutionHandlers,
        ...nodeExecutionHandlers,
        ...nodeExecutionListHandlers
    ];
}
