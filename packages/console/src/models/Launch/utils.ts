import { Admin } from '@flyteorg/flyteidl-types';
import { createPaginationTransformer } from 'models/AdminEntity/utils';
import { LaunchPlan } from './types';

/** Transformer to coerce an `Admin.LaunchPlanList` into a standard shape */
export const launchPlanListTransformer = createPaginationTransformer<
  LaunchPlan,
  Admin.LaunchPlanList
>('launchPlans');
