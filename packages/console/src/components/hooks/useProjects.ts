import { listProjects } from 'models/Project/api';
import { Project } from 'models/Project/types';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';

/** A hook for fetching the list of available projects */
export function useProjects(): [Project[], Error | any] {
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(),
  });

  const queryData = useMemo(() => {
    if (isEmpty(query.data) && !query.isSuccess) {
      return [] as Project[];
    }
    return query.data as Project[];
  }, [query.data]);

  return [queryData, query.error];
}

/** A hook for fetching a single Project */
export function useProject(id: string) {
  const [projects, error] = useProjects();

  const project = useMemo(() => {
    return projects.find(p => p.id === id);
  }, [projects, id]);

  return [project, error];
}
