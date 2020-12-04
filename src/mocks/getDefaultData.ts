import { RequestHandlersList } from 'msw/lib/types/setupWorker/glossary';
import { workflowExecutions } from './data/workflowExecutions';
import { workflowExecutionHandler } from './handlers';

export function getDefaultData(): RequestHandlersList {
    const workflowExecutionHandlers = Object.values(workflowExecutions).map(
        workflowExecutionHandler
    );
    return [...workflowExecutionHandlers];
}
