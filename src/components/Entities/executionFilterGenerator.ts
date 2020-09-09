import {
    FilterOperation,
    FilterOperationName,
    ResourceIdentifier,
    ResourceType
} from 'models';

const noFilters = () => [];

export const executionFilterGenerator: {
    [k in ResourceType]: (id: ResourceIdentifier) => FilterOperation[];
} = {
    [ResourceType.DATASET]: noFilters,
    [ResourceType.LAUNCH_PLAN]: noFilters,
    [ResourceType.TASK]: ({ name }) => [
        {
            key: 'launch_plan.name',
            operation: FilterOperationName.EQ,
            value: name
        }
    ],
    [ResourceType.UNSPECIFIED]: noFilters,
    [ResourceType.WORKFLOW]: ({ name }) => [
        {
            key: 'workflow.name',
            operation: FilterOperationName.EQ,
            value: name
        }
    ]
};
