import { useAPIContext } from 'components/data/apiContext';
import { RequestConfig } from 'models/AdminEntity/types';
import {
    IdentifierScope,
    NamedEntityIdentifier,
    ResourceType
} from 'models/Common/types';
import { Workflow } from 'models/Workflow/types';
import { usePagination } from './usePagination';

/** A hook for fetching a paginated list of workflows */
export function useWorkflows(scope: IdentifierScope, config: RequestConfig) {
    const { listWorkflows } = useAPIContext();
    return usePagination<Workflow, IdentifierScope>(
        // Workflows are not full records when listed, so don't
        // cache them
        { ...config, cacheItems: false, fetchArg: scope },
        listWorkflows
    );
}

/** A hook for fetching a paginated list of workflow ids */
export function useWorkflowIds(scope: IdentifierScope, config: RequestConfig) {
    const { listIdentifiers } = useAPIContext();
    return usePagination<NamedEntityIdentifier, IdentifierScope>(
        { ...config, fetchArg: scope },
        (scope, requestConfig) =>
            listIdentifiers(
                { scope, type: ResourceType.WORKFLOW },
                requestConfig
            )
    );
}
