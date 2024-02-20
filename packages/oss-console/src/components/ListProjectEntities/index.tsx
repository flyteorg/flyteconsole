import React, { useMemo } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import PageMeta from '@clients/primitives/PageMeta';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import withRouteParams from '../common/withRouteParams';
import { useProjects } from '../hooks/useProjects';
import { Routes } from '../../routes/routes';
import { ListProjectExecutions } from './ListProjectExecutions';
import { ListProjectTasks } from './ListProjectTasks';
import { ListProjectWorkflows } from './ListProjectWorkflows';
import { ListProjectLaunchPlans } from './ListProjectLaunchPlans';

export interface ProjectDetailsRouteParams {
  projectId: string;
  domainId: string;
}

/** The view component for the Project landing page */
export const ListProjectEntitiesSwitch: React.FC<ProjectDetailsRouteParams> = ({
  projectId,
  domainId,
}) => {
  const { data: projects, error: projectsError } = useProjects();

  const project = useMemo(() => {
    return projects?.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const domain = useMemo(() => {
    if (!project) return undefined;
    return project.domains.find((d) => d.id === domainId);
  }, [project, domainId]);

  const noProject = !project && !!projects?.length;
  if (noProject) {
    throw Error(
      `No project ID found. Please verify that the project ${projectId} and domain ${domainId} exist.`,
    );
  }

  const noDomain = !domain && !!project?.domains?.length;
  if (noDomain) {
    throw Error(
      `No domain ID found. Please verify that the project ${projectId} and domain ${domainId} exist.`,
    );
  }

  if (projectsError) {
    throw projectsError;
  }

  if (!projects || !project) {
    return <LoadingSpinner />;
  }

  return (
    <Switch>
      <Route path={Routes.ProjectDetails.sections.dashboard.path}>
        <PageMeta title="Executions" />
        <ListProjectExecutions projectId={project.id} domainId={domainId} />
      </Route>
      <Route path={Routes.ProjectDetails.sections.workflows.path}>
        <PageMeta title="Workflows" />
        <ListProjectWorkflows projectId={project.id} domainId={domainId} />
      </Route>
      <Route path={Routes.ProjectDetails.sections.tasks.path}>
        <PageMeta title="Tasks" />
        <ListProjectTasks projectId={project.id} domainId={domainId} />
      </Route>
      <Route path={Routes.ProjectDetails.sections.launchPlans.path}>
        <PageMeta title="Launch Plans" />
        <ListProjectLaunchPlans projectId={project.id} domainId={domainId} />
      </Route>
      <Redirect to={Routes.ProjectDetails.sections.dashboard.makeUrl(projectId, domainId)} />
    </Switch>
  );
};

export const ListProjectEntities: React.FunctionComponent<
  RouteComponentProps<ProjectDetailsRouteParams>
> = withRouteParams<ProjectDetailsRouteParams>(ListProjectEntitiesSwitch);

export default ListProjectEntities;
