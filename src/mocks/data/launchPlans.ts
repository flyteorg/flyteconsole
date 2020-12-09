import { Core } from 'flyteidl';
import { LaunchPlan } from 'models';
import { testDomain, testProject, testVersions } from './constants';

// TODO:
const basic: LaunchPlan = {
    id: {
        resourceType: Core.ResourceType.LAUNCH_PLAN,
        project: testProject,
        domain: testDomain,
        name: 'Basic',
        version: testVersions.v1
    }
} as LaunchPlan;

const nestedDynamic: LaunchPlan = {
    id: {
        resourceType: Core.ResourceType.LAUNCH_PLAN,
        project: testProject,
        domain: testDomain,
        name: 'NestedDynamic',
        version: testVersions.v1
    }
} as LaunchPlan;

export const launchPlans = { basic, nestedDynamic };
