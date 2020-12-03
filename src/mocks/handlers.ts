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
import { setupServer, SetupServerApi } from 'msw/lib/types/node';
import { RestContext } from 'msw/lib/types/rest';
import { apiPath } from './utils';

export function adminEntityResponder(
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

export function workflowExecutionHandler(
    server: SetupServerApi,
    data: Partial<Execution>
) {
    server.use(
        rest.get(
            apiPath(makeExecutionPath(data.id!)),
            adminEntityResponder(data, Admin.Execution)
        )
    );
}

export function workflowHandler(
    server: SetupServerApi,
    data: Partial<Workflow>
) {
    server.use(
        rest.get(
            apiPath(makeWorkflowPath(data.id!)),
            adminEntityResponder(data, Admin.Workflow)
        )
    );
}

export function nodeExecutionHandler(
    server: SetupServerApi,
    data: Partial<NodeExecution>
) {
    server.use(
        rest.get(
            apiPath(makeNodeExecutionPath(data.id!)),
            adminEntityResponder(data, Admin.NodeExecution)
        )
    );
}

// TODO: pagination responder that respects limit/token?
export function nodeExecutionListHandler(
    server: SetupServerApi,
    scope: NameIdentifierScope,
    data: Partial<NodeExecution>[]
) {
    server.use(
        rest.get(
            apiPath(makeNodeExecutionListPath(scope)),
            adminEntityResponder(
                {
                    nodeExecutions: data
                },
                Admin.NodeExecutionList
            )
        )
    );
}

export function bindHandlers(server: ReturnType<typeof setupServer>) {
    return {
        insertNodeExecution: nodeExecutionHandler.bind(null, server),
        insertNodeExecutionList: nodeExecutionListHandler.bind(null, server),
        insertWorkflow: workflowHandler.bind(null, server),
        insertWorkflowExecution: workflowExecutionHandler.bind(null, server)
    };
}
