import { Admin } from 'flyteidl';
import {
    EncodableType,
    encodeProtoPayload,
    Execution,
    NameIdentifierScope,
    NodeExecution,
    Project,
    Workflow
} from 'models';
import {
    makeExecutionPath,
    makeNodeExecutionListPath,
    makeNodeExecutionPath
} from 'models/Execution/utils';
import { makeWorkflowPath } from 'models/Workflow/utils';
import { rest } from 'msw';
import { setupServer } from 'msw/lib/types/node';
import { RestContext } from 'msw/lib/types/rest';
import { apiPath } from './utils';

export function protobufResponse(
    ctx: RestContext,
    data: any,
    encodeType: EncodableType<any>
) {
    const buffer = encodeProtoPayload(data, encodeType);
    const contentLength = buffer.byteLength.toString();
    return [
        ctx.set('Content-Type', 'application/octet-stream'),
        ctx.set('Content-Length', contentLength),
        ctx.body(buffer)
    ];
}

export function workflowExecutionHandler(data: Partial<Execution>) {
    return rest.get(apiPath(makeExecutionPath(data.id!)), (_, res, ctx) =>
        res(...protobufResponse(ctx, data, Admin.Execution))
    );
}

export function workflowHandler(data: Partial<Workflow>) {
    return rest.get(apiPath(makeWorkflowPath(data.id!)), (_, res, ctx) =>
        res(...protobufResponse(ctx, data, Admin.Workflow))
    );
}

export function nodeExecutionHandler(data: Partial<NodeExecution>) {
    return rest.get(apiPath(makeNodeExecutionPath(data.id!)), (_, res, ctx) =>
        res(...protobufResponse(ctx, data, Admin.NodeExecution))
    );
}

// TODO: pagination responder that respects limit/token?
export function nodeExecutionListHandler(
    scope: NameIdentifierScope,
    data: Partial<NodeExecution>[]
) {
    return rest.get(
        apiPath(makeNodeExecutionListPath(scope)),
        (_, res, ctx) => {
            return res(
                ...protobufResponse(
                    ctx,
                    {
                        nodeExecutions: data
                    },
                    Admin.NodeExecutionList
                )
            );
        }
    );
}

export function projectListHandler(data: Project[]) {
    return rest.get(apiPath('/projects'), (_, res, ctx) =>
        res(
            ...protobufResponse(
                ctx,
                {
                    projects: data
                },
                Admin.Projects
            )
        )
    );
}

export interface BoundAdminServer {
    insertNodeExecution(data: Partial<NodeExecution>): void;
    insertNodeExecutionList(
        scope: NameIdentifierScope,
        data: Partial<NodeExecution>[]
    ): void;
    insertProjects(data: Project[]): void;
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
        insertProjects: data => use(projectListHandler(data)),
        insertWorkflow: data => use(workflowHandler(data)),
        insertWorkflowExecution: data => use(workflowExecutionHandler(data))
    };
}
