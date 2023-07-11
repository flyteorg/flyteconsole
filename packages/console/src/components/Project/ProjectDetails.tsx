import * as React from 'react';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { withRouteParams } from 'components/common/withRouteParams';
import { useProject } from 'components/hooks/useProjects';
import { useQueryState } from 'components/hooks/useQueryState';
import { Project } from 'models/Project/types';
import { Redirect, Route, Switch } from 'react-router';
import { Routes } from 'routes/routes';
import { RouteComponentProps } from 'react-router-dom';
import { LoadingSpinner } from 'components/common';
import { ProjectDashboard } from './ProjectDashboard';
import { ProjectTasks } from './ProjectTasks';
import { ProjectWorkflows } from './ProjectWorkflows';
import { ProjectLaunchPlans } from './ProjectLaunchPlans';

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    textTransform: 'capitalize',
  },
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

export interface ProjectDetailsRouteParams {
  projectId: string;
}
export type ProjectDetailsProps = ProjectDetailsRouteParams;

const entityTypeToComponent = {
  executions: ProjectDashboard,
  tasks: ProjectTasks,
  workflows: ProjectWorkflows,
  launchPlans: ProjectLaunchPlans,
};

const ProjectEntitiesByDomain: React.FC<{
  project: Project;
  entityType: 'executions' | 'tasks' | 'workflows' | 'launchPlans';
}> = ({ entityType, project }) => {
  const { params } = useQueryState<{ domain: string }>();
  if (project && !project?.domains) {
    throw new Error('No domains exist for this project');
  }
  const domainId = React.useMemo(() => {
    if (params?.domain) {
      return params.domain;
    }
    return project?.domains ? project?.domains[0].id : '';
  }, [project, project?.domains, params?.domain]);

  const EntityComponent = entityTypeToComponent[entityType];

  return (
    <>
      {project?.id ? (
        <EntityComponent projectId={project.id} domainId={domainId} />
      ) : (
        <>
          <LoadingSpinner />
        </>
      )}
    </>
  );
};

const ProjectDashboardByDomain: React.FC<{ project: Project }> = ({
  project,
}) => <ProjectEntitiesByDomain project={project} entityType="executions" />;

const ProjectWorkflowsByDomain: React.FC<{ project: Project }> = ({
  project,
}) => <ProjectEntitiesByDomain project={project} entityType="workflows" />;

const ProjectTasksByDomain: React.FC<{ project: Project }> = ({ project }) => (
  <ProjectEntitiesByDomain project={project} entityType="tasks" />
);

const ProjectLaunchPlansByDomain: React.FC<{ project: Project }> = ({
  project,
}) => <ProjectEntitiesByDomain project={project} entityType="launchPlans" />;

/** The view component for the Project landing page */
export const ProjectDetailsContainer: React.FC<ProjectDetailsRouteParams> = ({
  projectId,
}) => {
  const [project] = useProject(projectId);

  if (!project?.id) {
    return <LoadingSpinner />;
  }

  return (
    <Switch>
      <Route path={Routes.ProjectDetails.sections.dashboard.path}>
        <ProjectDashboardByDomain project={project} />
      </Route>
      <Route path={Routes.ProjectDetails.sections.workflows.path}>
        <ProjectWorkflowsByDomain project={project} />
      </Route>
      <Route path={Routes.ProjectDetails.sections.tasks.path}>
        <ProjectTasksByDomain project={project} />
      </Route>
      <Route path={Routes.ProjectDetails.sections.launchPlans.path}>
        <ProjectLaunchPlansByDomain project={project} />
      </Route>
      <Redirect
        to={Routes.ProjectDetails.sections.workflows.makeUrl(projectId)}
      />
    </Switch>
  );
};

export const ProjectDetails: React.FunctionComponent<
  RouteComponentProps<ProjectDetailsRouteParams>
> = withRouteParams<ProjectDetailsRouteParams>(ProjectDetailsContainer);
