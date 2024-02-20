import Admin from '@clients/common/flyteidl/admin';
import Core from '@clients/common/flyteidl/core';

import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { getAdminEntity, postAdminEntity } from '../AdminEntity/AdminEntity';
import { defaultPaginationConfig } from '../AdminEntity/constants';
import { Identifier, IdentifierScope } from '../Common/types';
import { makeNamedEntityPath } from '../Common/utils';
import { NamedEntityState } from '../enums';
import { Task } from './types';
import { makeTaskPath, taskListTransformer } from './utils';

/** Fetches a list of `Task` records matching the provided `scope` */
export const listTasks = (scope: IdentifierScope, config?: RequestConfig) =>
  getAdminEntity(
    {
      path: makeTaskPath(scope),
      messageType: Admin.TaskList,
      transform: taskListTransformer,
    },
    { ...defaultPaginationConfig, ...config },
  );

/** Fetches an individual `Task` record */
export const getTask = (id: Identifier, config?: RequestConfig) =>
  getAdminEntity<Admin.Task, Task>(
    {
      path: makeTaskPath(id),
      messageType: Admin.Task,
    },
    config,
  );

/** Updates `Task` archive state */
export const updateTaskState = (
  id: Admin.NamedEntityIdentifier,
  newState: NamedEntityState,
  config?: RequestConfig,
) => {
  const path = makeNamedEntityPath({
    resourceType: Core.ResourceType.TASK,
    ...id,
  });
  return postAdminEntity<Admin.INamedEntityUpdateRequest, Admin.NamedEntityUpdateResponse>(
    {
      data: {
        resourceType: Core.ResourceType.TASK,
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
