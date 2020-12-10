import { CompiledTask, ResourceType, SimpleType, Task } from 'models';
import {
    entityCreationDate,
    testDomain,
    testProject,
    testVersions,
    variableNames
} from './constants';

function makeTask(compiledTask: CompiledTask): Task {
    return {
        closure: { createdAt: { ...entityCreationDate }, compiledTask },
        id: compiledTask.template.id
    };
}

const basicPython = makeTask({
    template: {
        custom: {},
        container: {},
        metadata: {},
        type: 'python-task',
        id: {
            resourceType: ResourceType.TASK,
            project: testProject,
            domain: testDomain,
            name: 'BasicPythonTask',
            version: testVersions.v1
        },
        interface: {
            inputs: {
                variables: {
                    [variableNames.basicString]: {
                        description: 'A string which will be echoed to output',
                        type: { simple: SimpleType.STRING }
                    }
                }
            },
            outputs: {
                variables: {
                    [variableNames.basicString]: {
                        description:
                            'A copy of the string provided to this task',
                        type: { simple: SimpleType.STRING }
                    }
                }
            }
        }
    }
});

const dynamic = makeTask({
    template: {
        custom: {},
        container: {},
        metadata: {},
        type: 'dynamic-task',
        id: {
            resourceType: ResourceType.TASK,
            project: testProject,
            domain: testDomain,
            name: 'DynamicTask',
            version: testVersions.v1
        },
        interface: {
            inputs: {
                variables: {
                    [variableNames.basicString]: {
                        description: 'A string which will be echoed to output',
                        type: { simple: SimpleType.STRING }
                    }
                }
            },
            outputs: {
                variables: {
                    [variableNames.basicString]: {
                        description:
                            'A copy of the string provided to this task',
                        type: { simple: SimpleType.STRING }
                    }
                }
            }
        }
    }
});

export const tasks = {
    basicPython,
    dynamic
};
