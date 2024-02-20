import Admin from '@clients/common/flyteidl/admin';
import { QueryClient } from 'react-query';
import { QueryInput, QueryType } from '../components/data/types';
import {
  getProjectAttributes,
  getProjectDomainAttributes,
  listProjects,
} from '../models/Project/api';
import { IdentifierScope } from '../models/Common/types';
import { createDebugLogger } from '../common/log';
import { Project } from '../models/Project/types';

const debug = createDebugLogger('@projectQueries');

/**
 * A query for fetching all projects.
 * @param queryClient The react-query client
 * @returns A list of projects for the current domain.
 */
export function makeListProjectsQuery(queryClient: QueryClient): QueryInput<Project[]> {
  return {
    queryKey: [QueryType.ListProjects],
    queryFn: async () => {
      const projects = await listProjects();

      queryClient.setQueryData([QueryType.ListProjects], projects);

      return projects;
    },
    staleTime: Infinity,
  };
}

/** Composable fetch function which wraps `makeTaskExecutionListQuery` */
export async function fetchProjectsList(queryClient: QueryClient) {
  return queryClient.fetchQuery(makeListProjectsQuery(queryClient));
}

/**
 * A query for fetching all projects.
 * @param queryClient The react-query client
 * @returns A list of projects for the current domain.
 */
export function makeProjectQuery(
  queryClient: QueryClient,
  id: string,
): QueryInput<Project | undefined> {
  return {
    queryKey: [QueryType.GetProject],
    queryFn: async () => {
      const projects = await fetchProjectsList(queryClient);

      const project = projects?.find((p) => p.id === id);

      queryClient.setQueryData([QueryType.GetProject], project);

      return project;
    },
    staleTime: Infinity,
  };
}

/**
 * A query for fetching project domain attributes.
 * @param scope The IdentifierScope
 * @param queryClient The react-query client
 * @returns
 */
export function makeProjectDomainAttributesQuery(
  scope: IdentifierScope,
  queryClient: QueryClient,
): QueryInput<Admin.ProjectDomainAttributesGetResponse> {
  return {
    queryKey: [QueryType.ProjectDomainAttributes, scope],
    queryFn: async () => {
      try {
        const projectDomainAttributes = await getProjectDomainAttributes(scope);

        queryClient.setQueryData(
          [QueryType.ProjectDomainAttributes, scope],
          projectDomainAttributes,
        );

        return projectDomainAttributes;
      } catch (error) {
        debug('makeProjectDomainAttributesQuery error', error);
      }

      return {} as Admin.ProjectDomainAttributesGetResponse;
    },
    staleTime: Infinity,
  };
}

/**
 * A query for fetching project domain attributes.
 * @param scope The IdentifierScope
 * @param queryClient The react-query client
 * @returns
 */
export function makeProjectAttributesQuery(
  scope: IdentifierScope,
  queryClient: QueryClient,
): QueryInput<Admin.ProjectAttributesGetResponse> {
  return {
    queryKey: [QueryType.ProjectAttributes, scope],
    queryFn: async () => {
      try {
        const projectAttributes = await getProjectAttributes(scope);

        queryClient.setQueryData([QueryType.ProjectAttributes, scope], projectAttributes);

        return projectAttributes;
      } catch (error) {
        debug('makeProjectAttributesQuery error', error);
      }

      return {} as Admin.ProjectAttributesGetResponse;
    },
    staleTime: Infinity,
  };
}
