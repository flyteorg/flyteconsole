import Admin from '@clients/common/flyteidl/admin';
import { createPaginationTransformer } from '../AdminEntity/utils';
import { LaunchPlan } from './types';

/** Transformer to coerce an `Admin.LaunchPlanList` into a standard shape */
export const launchPlanListTransformer = createPaginationTransformer<
  LaunchPlan,
  Admin.LaunchPlanList
>('launchPlans');
