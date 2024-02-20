import Admin from '@clients/common/flyteidl/admin';
import Core from '@clients/common/flyteidl/core';

import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { getAdminEntity, postAdminEntity } from '../AdminEntity/AdminEntity';
import { defaultPaginationConfig } from '../AdminEntity/constants';
import { Identifier, IdentifierScope, NamedEntityIdentifier } from '../Common/types';
import { makeNamedEntityPath } from '../Common/utils';
import { NamedEntityState } from '../enums';
import { Workflow } from './types';
import { makeWorkflowPath, workflowListTransformer } from './utils';

/** Fetches a list of `Workflow` records matching the provided `scope` */
export const listWorkflows = (scope: IdentifierScope, config?: RequestConfig) =>
  getAdminEntity(
    {
      path: makeWorkflowPath(scope),
      messageType: Admin.WorkflowList,
      transform: workflowListTransformer,
    },
    { ...defaultPaginationConfig, ...config },
  );

/** Retrieves a single `Workflow` record */
export const getWorkflow = (id: Identifier, config?: RequestConfig) =>
  getAdminEntity<Admin.Workflow, Workflow>(
    {
      path: makeWorkflowPath(id),
      messageType: Admin.Workflow,
    },
    config,
  );

/** Updates `Workflow` archive state */
export const updateWorkflowState = (
  id: NamedEntityIdentifier,
  newState: NamedEntityState,
  config?: RequestConfig,
) => {
  const path = makeNamedEntityPath({
    resourceType: Core.ResourceType.WORKFLOW,
    ...id,
  });
  return postAdminEntity<Admin.INamedEntityUpdateRequest, Admin.NamedEntityUpdateResponse>(
    {
      data: {
        resourceType: Core.ResourceType.WORKFLOW,
        id,
        metadata: {
          state: newState,
        },
      },
      path,
      requestMessageType: Admin.NamedEntityUpdateRequest,
      responseMessageType: Admin.NamedEntityUpdateResponse,
      method: 'put',
    },
    config,
  );
};
