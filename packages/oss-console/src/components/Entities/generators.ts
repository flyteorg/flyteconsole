import { FilterOperation, FilterOperationName } from '@clients/common/types/adminEntityTypes';
import { ResourceIdentifier, ResourceType, Identifier } from '../../models/Common/types';
import { Routes } from '../../routes/routes';

const noFilters = () => [];

export const executionFilterGenerator: {
  [k in ResourceType]: (id: ResourceIdentifier, version?: string) => FilterOperation[];
} = {
  [ResourceType.DATASET]: noFilters,
  [ResourceType.LAUNCH_PLAN]: ({ name }, version) => [
    {
      key: 'launch_plan.name',
      operation: FilterOperationName.EQ,
      value: name,
    },
    ...(version
      ? [
          {
            key: 'launch_plan.version',
            operation: FilterOperationName.EQ,
            value: version,
          },
        ]
      : []),
  ],
  [ResourceType.TASK]: ({ name }, version) => [
    {
      key: 'task.name',
      operation: FilterOperationName.EQ,
      value: name,
    },
    ...(version
      ? [
          {
            key: 'workflow.version',
            operation: FilterOperationName.EQ,
            value: version,
          },
        ]
      : []),
  ],
  [ResourceType.UNSPECIFIED]: noFilters,
  [ResourceType.WORKFLOW]: ({ name }, version) => [
    {
      key: 'workflow.name',
      operation: FilterOperationName.EQ,
      value: name,
    },
    ...(version
      ? [
          {
            key: 'workflow.version',
            operation: FilterOperationName.EQ,
            value: version,
          },
        ]
      : []),
  ],
};

const unspecifiedGenerator = ({
  project: _project,
  domain: _domain,
}: ResourceIdentifier | Identifier) => {
  throw new Error('Unspecified Resourcetype.');
};
const unimplementedGenerator = ({
  project: _project,
  domain: _domain,
}: ResourceIdentifier | Identifier) => {
  throw new Error('Method not implemented.');
};

const workflowVersopmDetailsGenerator = (id: Identifier) => Routes.EntityVersionDetails.makeUrl(id);
const taskVersionDetailsGenerator = (id: Identifier) => Routes.EntityVersionDetails.makeUrl(id);
const launchPlanVersionDetailsGenerator = (id: Identifier) =>
  Routes.EntityVersionDetails.makeUrl(id);

const entityMapVersionDetailsUrl: {
  [k in ResourceType]: (id: Identifier) => string;
} = {
  [ResourceType.DATASET]: unimplementedGenerator,
  [ResourceType.LAUNCH_PLAN]: launchPlanVersionDetailsGenerator,
  [ResourceType.TASK]: taskVersionDetailsGenerator,
  [ResourceType.UNSPECIFIED]: unspecifiedGenerator,
  [ResourceType.WORKFLOW]: workflowVersopmDetailsGenerator,
};

export const versionDetailsUrlGenerator = (id: Identifier): string => {
  if (id?.resourceType) return entityMapVersionDetailsUrl[id?.resourceType](id);
  return '';
};
