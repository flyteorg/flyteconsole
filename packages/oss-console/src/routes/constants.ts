import { makePathPattern } from '@clients/common/routes';

const projectPrefix = '/projects/:projectId';

export const projectDomainBasePath = makePathPattern(`${projectPrefix}/domains/:domainId`);
