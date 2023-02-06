import { Admin, Core } from '@flyteorg/flyteidl-types';
import {
  getAdminEntity,
  postAdminEntity,
} from 'models/AdminEntity/AdminEntity';
import { defaultPaginationConfig } from 'models/AdminEntity/constants';
import { RequestConfig } from 'models/AdminEntity/types';
import { endpointPrefixes } from 'models/Common/constants';
import { Identifier, IdentifierScope } from 'models/Common/types';
import { makeIdentifierPath, makeNamedEntityPath } from 'models/Common/utils';
import { NamedEntityState } from 'models/enums';
import { LaunchPlan } from './types';
import { launchPlanListTransformer } from './utils';

/** Fetches a list of `LaunchPlan` records matching the provided `scope` */
export const listLaunchPlans = (
  scope: IdentifierScope,
  config?: RequestConfig,
) =>
  getAdminEntity(
    {
      path: makeIdentifierPath(endpointPrefixes.launchPlan, scope),
      messageType: Admin.LaunchPlanList,
      transform: launchPlanListTransformer,
    },
    { ...defaultPaginationConfig, ...config },
  );

/** Fetches an individual `LaunchPlan` */
export const getLaunchPlan = (id: Identifier, config?: RequestConfig) =>
  getAdminEntity<Admin.LaunchPlan, LaunchPlan>(
    {
      path: makeIdentifierPath(endpointPrefixes.launchPlan, id),
      messageType: Admin.LaunchPlan,
    },
    config,
  );

/** Updates `Workflow` archive state */
export const updateLaunchPlanState = (
  id: Admin.NamedEntityIdentifier,
  newState: NamedEntityState,
  config?: RequestConfig,
) => {
  const path = makeNamedEntityPath({
    resourceType: Core.ResourceType.LAUNCH_PLAN,
    ...id,
  });
  return postAdminEntity<
    Admin.INamedEntityUpdateRequest,
    Admin.NamedEntityUpdateResponse
  >(
    {
      data: {
        resourceType: Core.ResourceType.LAUNCH_PLAN,
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
