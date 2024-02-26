import Admin from '@clients/common/flyteidl/admin';
import sortBy from 'lodash/sortBy';
import { endpointPrefixes } from '../Common/constants';

import { getAdminEntity } from '../AdminEntity/AdminEntity';
import { IdentifierScope } from '../Common/types';
import { Project } from './types';
import { makeProjectDomainAttributesPath } from './utils';

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

export const getProjectAttributes = (scope: IdentifierScope) =>
  getAdminEntity<Admin.ProjectAttributesGetResponse, Admin.ProjectAttributesGetResponse>(
    {
      path: makeProjectDomainAttributesPath(endpointPrefixes.projectAttributes, scope),
      messageType: Admin.ProjectAttributesGetResponse,
    },
    {
      params: {
        resource_type: Admin.MatchableResource.WORKFLOW_EXECUTION_CONFIG,
      },
    },
  );

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
        resource_type: Admin.MatchableResource.WORKFLOW_EXECUTION_CONFIG,
      },
    },
  );
