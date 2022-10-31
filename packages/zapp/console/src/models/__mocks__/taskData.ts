import { getCacheKey, Identifier, ResourceType, Task, TaskClosure } from '@flyteconsole/components';
import { Admin } from '@flyteconsole/flyteidl';
import { cloneDeep } from 'lodash';
import { testDomain, testProject } from 'mocks/data/constants';
import * as simpleClosure from './simpleTaskClosure.json';

const decodedClosure = Admin.TaskClosure.create(
  simpleClosure as unknown as Admin.ITaskClosure,
) as TaskClosure;

const taskId: (name: string, version: string) => Identifier = (name, version) => ({
  name,
  version,
  project: testProject,
  domain: testDomain,
  resourceType: ResourceType.TASK,
});

export const createMockTask: (name: string, version?: string) => Task = (
  name: string,
  version = 'abcdefg',
) => ({
  id: taskId(name, version),
  closure: createMockTaskClosure(),
});

export const createMockTaskClosure: () => TaskClosure = () => cloneDeep(decodedClosure);

export const createMockTaskVersions = (name: string, length: number) => {
  return Array.from({ length }, (_, idx) => {
    return createMockTask(name, getCacheKey({ idx }));
  });
};
