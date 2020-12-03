import { apiPrefix } from './constants';

export function apiPath(path: string) {
    return `${apiPrefix}${path}`;
}
