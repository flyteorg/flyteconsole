import { NamedEntityState } from 'models/enums';
import { LaunchPlanListStructureItem } from './types';

function isLaunchPlanStateArchive(
  launchPlan: LaunchPlanListStructureItem,
): boolean {
  const state = launchPlan?.state ?? null;
  return !!state && state === NamedEntityState.NAMED_ENTITY_ARCHIVED;
}

export function isLaunchPlanArchived(
  launchPlan: LaunchPlanListStructureItem,
): boolean {
  return isLaunchPlanStateArchive(launchPlan);
}
