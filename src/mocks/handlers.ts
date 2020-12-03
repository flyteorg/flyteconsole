import { Admin } from 'flyteidl';
import {
    EncodableType,
    encodeProtoPayload,
    Execution,
    NameIdentifierScope,
    NodeExecution,
    Workflow
} from 'models';
import {
    makeExecutionPath,
    makeNodeExecutionListPath,
    makeNodeExecutionPath
} from 'models/Execution/utils';
import { makeWorkflowPath } from 'models/Workflow/utils';
import { ResponseResolver, rest } from 'msw';
import { setupServer } from 'msw/lib/types/node';
import { RestContext } from 'msw/lib/types/rest';
import { apiPrefix } from './constants';

function apiPath(path: string) {
    return `${apiPrefix}${path}`;
}

function adminEntityResponder(
    data: any,
    encodeType: EncodableType<any>
): ResponseResolver<any, RestContext> {
    const buffer = encodeProtoPayload(data, encodeType);
    const contentLength = buffer.byteLength.toString();
    return (_, res, ctx) =>
        res(
            ctx.set('Content-Type', 'application/octet-stream'),
            ctx.set('Content-Length', contentLength),
            ctx.body(buffer)
        );
}

export function workflowExecutionHandler(data: Partial<Execution>) {
    return rest.get(
        apiPath(makeExecutionPath(data.id!)),
        adminEntityResponder(data, Admin.Execution)
    );
}

export function workflowHandler(data: Partial<Workflow>) {
    return rest.get(
        apiPath(makeWorkflowPath(data.id!)),
        adminEntityResponder(data, Admin.Workflow)
    );
}

export function nodeExecutionHandler(data: Partial<NodeExecution>) {
    return rest.get(
        apiPath(makeNodeExecutionPath(data.id!)),
        adminEntityResponder(data, Admin.NodeExecution)
    );
}

// TODO: pagination responder that respects limit/token?
export function nodeExecutionListHandler(
    scope: NameIdentifierScope,
    data: Partial<NodeExecution>[]
) {
    return rest.get(
        apiPath(makeNodeExecutionListPath(scope)),
        adminEntityResponder(
            {
                nodeExecutions: data
            },
            Admin.NodeExecutionList
        )
    );
}

export interface BoundAdminServer {
    insertNodeExecution(data: Partial<NodeExecution>): void;
    insertNodeExecutionList(
        scope: NameIdentifierScope,
        data: Partial<NodeExecution>[]
    ): void;
    insertWorkflow(data: Partial<Workflow>): void;
    insertWorkflowExecution(data: Partial<Execution>): void;
}

export function bindHandlers({
    use
}: ReturnType<typeof setupServer>): BoundAdminServer {
    return {
        insertNodeExecution: data => use(nodeExecutionHandler(data)),
        insertNodeExecutionList: (scope, data) =>
            use(nodeExecutionListHandler(scope, data)),
        insertWorkflow: data => use(workflowHandler(data)),
        insertWorkflowExecution: data => use(workflowExecutionHandler(data))
    };
}
