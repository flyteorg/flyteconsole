import { Core } from 'flyteidl';
import { LaunchPlan } from 'models';

// TODO:
const basic: LaunchPlan = {
    id: {
        resourceType: Core.ResourceType.LAUNCH_PLAN,
        project: 'flytetest',
        domain: 'development',
        name: 'Basic',
        version: 'abc123'
    }
} as LaunchPlan;

export const launchPlans: Record<string, LaunchPlan> = { basic };
