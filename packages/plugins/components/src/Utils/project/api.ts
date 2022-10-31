import { sortBy } from 'lodash';
import { Admin, IdentifierScope, Project } from '../../models';
import { getAdminEntity } from '../../AdminEntity';
import { endpointPrefixes } from './constants';
import { makeProjectDomainAttributesPath } from './project';

/** Fetches the list of available `Project`s */
export const listProjects = () =>
  getAdminEntity<Admin.Projects, Project[]>({
    path: endpointPrefixes.project,
    messageType: Admin.Projects,
    // We want the returned list to be sorted ascending by name, but the
    // admin endpoint doesn't support sorting for projects.
    transform: ({ projects }: Admin.Projects) =>
      sortBy(projects, (project) => `${project.name}`.toLowerCase()) as Project[],
  });

export const getProjectDomainAttributes = (scope: IdentifierScope) =>
  getAdminEntity<
    Admin.ProjectDomainAttributesGetResponse,
    Admin.ProjectDomainAttributesGetResponse
  >(
    {
      path: makeProjectDomainAttributesPath(endpointPrefixes.projectDomainAtributes, scope),
      messageType: Admin.ProjectDomainAttributesGetResponse,
    },
    {
      params: {
        resource_type: 'WORKFLOW_EXECUTION_CONFIG',
      },
    },
  );
