import { Core } from 'flyteidl';
import { Workflow } from 'models/Workflow/types';

// TODO:
const basic: Workflow = {
    id: {
        resourceType: Core.ResourceType.WORKFLOW,
        project: 'flytetest',
        domain: 'development',
        name: 'Basic',
        version: 'abc123'
    }
};

export const workflows: Record<string, Workflow> = { basic };
