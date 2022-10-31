import { Admin } from '@flyteconsole/flyteidl';
import { createPaginationTransformer } from '@flyteconsole/components';
import { LaunchPlan } from './types';

/** Transformer to coerce an `Admin.LaunchPlanList` into a standard shape */
export const launchPlanListTransformer = createPaginationTransformer<
  LaunchPlan,
  Admin.LaunchPlanList
>('launchPlans');
