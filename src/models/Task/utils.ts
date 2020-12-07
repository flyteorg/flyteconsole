import { Admin } from 'flyteidl';
import { createPaginationTransformer } from 'models/AdminEntity';
import { endpointPrefixes } from 'models/Common/constants';
import { IdentifierScope } from 'models/Common/types';
import { makeIdentifierPath } from 'models/Common/utils';

import { Task } from './types';

export function makeTaskPath(scope: IdentifierScope) {
    return makeIdentifierPath(endpointPrefixes.task, scope);
}

/** Transformer to coerce an `Admin.TaskList` into a standard shape */
export const taskListTransformer = createPaginationTransformer<
    Task,
    Admin.TaskList
>('tasks');
