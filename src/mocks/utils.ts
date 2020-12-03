import { apiPrefix } from 'models/AdminEntity/constants';

export function apiPath(path: string) {
    return `${apiPrefix}${path}`;
}
