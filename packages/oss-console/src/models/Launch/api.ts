import Admin from '@clients/common/flyteidl/admin';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { getAdminEntity, postAdminEntity } from '../AdminEntity/AdminEntity';
import { defaultPaginationConfig } from '../AdminEntity/constants';
import { endpointPrefixes } from '../Common/constants';
import { Identifier, IdentifierScope } from '../Common/types';
import { makeIdentifierPath } from '../Common/utils';
import { LaunchPlan, LaunchPlanState } from './types';
import { launchPlanListTransformer } from './utils';

/** Fetches a list of `LaunchPlan` records matching the provided `scope` */
export const listLaunchPlans = (scope: Partial<IdentifierScope>, config?: RequestConfig) =>
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

/** Updates Launch Plan schedule state */
export const updateLaunchPlan = (
  id: Identifier | undefined,
  newState: LaunchPlanState,
  config?: RequestConfig,
): Promise<Admin.LaunchPlanUpdateResponse> => {
  if (!id) {
    throw new Error('Cannot update Launch Plan without an id');
  }
  return postAdminEntity<Admin.LaunchPlanUpdateRequest, Admin.LaunchPlanUpdateResponse>(
    {
      data: { id, state: newState },
      path: makeIdentifierPath(endpointPrefixes.launchPlan, id),
      requestMessageType: Admin.LaunchPlanUpdateRequest,
      responseMessageType: Admin.LaunchPlanUpdateResponse,
      method: 'put',
    },
    config,
  );
};
