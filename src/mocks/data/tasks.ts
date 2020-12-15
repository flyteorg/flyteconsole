import { DeepPartial } from 'common/types';
import { cloneDeep, merge } from 'lodash';
import {
    CompiledTask,
    Identifier,
    ResourceType,
    SimpleType,
    Task
} from 'models';
import {
    entityCreationDate,
    testDomain,
    testProject,
    testVersions,
    variableNames
} from './constants';

export function taskFromCompiledTask(compiledTask: CompiledTask): Task {
    return {
        closure: { createdAt: { ...entityCreationDate }, compiledTask },
        id: compiledTask.template.id
    };
}

const baseTaskTemplate: CompiledTask = {
    template: {
        custom: {},
        container: {},
        metadata: {},
        type: 'unknown-type',
        id: {
            resourceType: ResourceType.TASK,
            project: testProject,
            domain: testDomain,
            name: '_base',
            version: testVersions.v1
        },
        interface: {
            inputs: {
                variables: {}
            },
            outputs: {
                variables: {}
            }
        }
    }
};

export function generateTask(
    id?: Partial<Identifier>,
    compiledTaskOverrides?: DeepPartial<CompiledTask>
): Task {
    return taskFromCompiledTask(
        merge(
            cloneDeep(baseTaskTemplate),
            { template: { id } },
            compiledTaskOverrides
        )
    );
}

const basicPython = generateTask(
    { name: 'BasicPythonTask' },
    {
        template: {
            type: 'python-task',
            interface: {
                inputs: {
                    variables: {
                        [variableNames.basicString]: {
                            description:
                                'A string which will be echoed to output',
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
    }
);

const dynamic = generateTask(
    { name: 'DynamicTask' },
    {
        template: {
            type: 'dynamic-task',
            interface: {
                inputs: {
                    variables: {
                        [variableNames.basicString]: {
                            description:
                                'A string which will be echoed to output',
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
    }
);

export const tasks = {
    basicPython,
    dynamic
};
