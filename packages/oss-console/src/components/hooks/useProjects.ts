import { useMemo } from 'react';
import { UseQueryResult, useQuery, useQueryClient } from 'react-query';
import { makeListProjectsQuery, makeProjectQuery } from '../../queries/projectQueries';
import { Project } from '../../models/Project/types';

/** A hook for fetching the list of available projects */
export function useProjects(refetchInterval?: number) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...makeListProjectsQuery(queryClient),
    refetchInterval,
  });

  return query;
}

/** A hook for fetching a single Project */
export function useProject(
  id: string,
  refetchInterval?: number,
): UseQueryResult<Project | undefined, Error> {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...makeProjectQuery(queryClient, id),
    refetchInterval,
  });

  return query;
}
