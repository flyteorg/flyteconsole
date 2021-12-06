import { DomainIdentifierScope, ResourceType } from 'models/Common/types';
import { RequestConfig } from 'models/AdminEntity/types';
import { usePagination } from 'components/hooks/usePagination';
import { listNamedEntities } from 'models/Common/api';
import { WorkflowListStructureItem } from './types';

export const useWorkflowInfoList = (
    scope: DomainIdentifierScope,
    config?: RequestConfig
) => {
    return usePagination<WorkflowListStructureItem, DomainIdentifierScope>(
        { ...config, fetchArg: scope },
        async (scope, requestConfig) => {
            const { entities, ...rest } = await listNamedEntities(
                { ...scope, resourceType: ResourceType.WORKFLOW },
                requestConfig
            );

            return {
                entities: entities.map(({ id, metadata: { description } }) => ({
                    id,
                    description
                })),
                ...rest
            };
        }
    );
};
