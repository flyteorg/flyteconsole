import { makeOrgAwarePath, makeOrgAwarePathPattern, makeRoute } from '@clients/common/routes';
import { checkIsNumber } from '@clients/primitives/utils/format';
import { ensureSlashPrefixed } from '../common/utils';
import { TaskExecutionIdentifier, WorkflowExecutionIdentifier } from '../models/Execution/types';
import { projectDomainBasePath } from './constants';
import { TaskExecutionPhase } from '../models/Execution/enums';
import { Identifier, ResourceType } from '../models/Common/types';

export enum TaskExecutionTabEnum {
  resources = 'resources',
  logs = 'logs',
  io = 'io',
  flytedecks = 'flytedecks',
}

/** Creates a path relative to a particular project */
export const makeProjectBoundPath = (projectId: string, path = '') => {
  return makeRoute(`/projects/${projectId}${path.length ? ensureSlashPrefixed(path) : path}`);
};

/** Creates a path relative to a particular project and domain. Paths should begin with a slash (/) */
export const makeProjectDomainBoundPath = (projectId: string, domainId: string, path = '') =>
  makeRoute(`/projects/${projectId}/domains/${domainId}${path}`);

export type TaskExecutionIdentifierRoute = TaskExecutionIdentifier & {
  viewName?: TaskExecutionTabEnum;
  dynamicParentNodeId?: string;
  // mapped task props
  mappedAttempt?: number;
  mappedIndex?: number;
  phase?: TaskExecutionPhase;
};

class RoutesConfig {
  NotFound = {};

  // Landing page
  SelectProject = {
    id: '__FLYTE__VIEW_ALL_PROJECTS__',
    pattern: makeOrgAwarePathPattern('/select-project'),
    path: makeOrgAwarePath('/select-project'),
  };

  // Projects
  ProjectDetails = {
    makeUrl: (project: string, section?: string) => {
      if (project === this.SelectProject.id) {
        return makeOrgAwarePath('/select-project');
      }
      return makeProjectBoundPath(project, section ? `/${section}` : '');
    },
    path: projectDomainBasePath,
    sections: {
      dashboard: {
        makeUrl: (project: string, domain: string) => {
          return makeProjectDomainBoundPath(project, domain, '/executions');
        },
        path: `${projectDomainBasePath}/executions`,
      },
      tasks: {
        makeUrl: (project: string, domain: string) =>
          makeProjectDomainBoundPath(project, domain, `/tasks`),
        path: `${projectDomainBasePath}/tasks`,
      },
      workflows: {
        makeUrl: (project: string, domain: string) =>
          makeProjectDomainBoundPath(project, domain, `/workflows`),
        path: `${projectDomainBasePath}/workflows`,
      },
      launchPlans: {
        makeUrl: (project: string, domain: string) =>
          makeProjectDomainBoundPath(project, domain, `/launchPlans`),
        path: `${projectDomainBasePath}/launchPlans`,
      },
    },
  };

  ProjectDashboard = {
    makeUrl: (project: string, domain: string) =>
      makeProjectDomainBoundPath(project, domain, '/executions'),
    path: `${projectDomainBasePath}/executions`,
  };

  ProjectTasks = {
    makeUrl: (project: string, domain: string) =>
      makeProjectDomainBoundPath(project, domain, '/tasks'),
    path: `${projectDomainBasePath}/tasks`,
  };

  ProjectWorkflows = {
    makeUrl: (project: string, domain: string) =>
      makeProjectDomainBoundPath(project, domain, '/workflows'),
    path: `${projectDomainBasePath}/workflows`,
  };

  EntityDetails = {
    makeUrl: (id: Identifier) => {
      const { project, domain, name, resourceType } = id;
      const EntityToPathSegment: { [k in ResourceType]?: string } = {
        [ResourceType.LAUNCH_PLAN]: 'launchPlans',
        [ResourceType.TASK]: 'tasks',
        [ResourceType.WORKFLOW]: 'workflows',
      };
      const entityTypePath = EntityToPathSegment[resourceType!];

      return makeProjectDomainBoundPath(project, domain, `/${entityTypePath}/${name}`);
    },
    path: `${projectDomainBasePath}/:entityType/:entityName`,
  };

  EntityVersionDetails = {
    makeUrl: (id: Identifier) => {
      const { project, domain, name, resourceType, version } = id;
      const EntityToPathSegment: { [k in ResourceType]?: string } = {
        [ResourceType.LAUNCH_PLAN]: 'launch_plan',
        [ResourceType.TASK]: 'task',
        [ResourceType.WORKFLOW]: 'workflow',
      };
      const entityTypePath = EntityToPathSegment[resourceType!];

      return makeProjectDomainBoundPath(
        project,
        domain,
        `/${entityTypePath}/${name}/version/${encodeURIComponent(version)}`,
      );
    },
    path: `${projectDomainBasePath}/:entityType/:entityName/version/:entityVersion`,
  };

  // Workflows
  WorkflowDetails = {
    makeUrl: (project: string, domain: string, workflowName: string) =>
      makeProjectDomainBoundPath(project, domain, `/workflows/${workflowName}`),
    path: `${projectDomainBasePath}/(workflows|workflow)/:workflowName`,
  };

  WorkflowVersionDetails = {
    makeUrl: (project: string, domain: string, entityName: string, version: string) =>
      makeProjectDomainBoundPath(
        project,
        domain,
        `/workflow/${entityName}/version/${encodeURIComponent(version)}`,
      ),
    path: `${projectDomainBasePath}/workflow/:entityName/version/:entityVersion`,
  };

  // LaunchPlans
  LaunchPlanDetails = {
    makeUrl: (project: string, domain: string, launchPlanName: string) =>
      makeProjectDomainBoundPath(project, domain, `/launchPlans/${launchPlanName}`),
    path: `${projectDomainBasePath}/launchPlans/:launchPlanName`,
  };

  LaunchPlanVersionDetails = {
    makeUrl: (project: string, domain: string, entityName: string, version: string) =>
      makeProjectDomainBoundPath(
        project,
        domain,
        `/launch_plan/${entityName}/version/${encodeURIComponent(version)}`,
      ),
    path: `${projectDomainBasePath}/launch_plan/:entityName/version/:entityVersion`,
  };

  // Tasks
  TaskDetails = {
    makeUrl: (project: string, domain: string, taskName: string) =>
      makeProjectDomainBoundPath(project, domain, `/tasks/${taskName}`),
    path: `${projectDomainBasePath}/tasks/:taskName`,
  };

  TaskVersionDetails = {
    makeUrl: (project: string, domain: string, entityName: string, version: string) =>
      makeProjectDomainBoundPath(
        project,
        domain,
        `/task/${entityName}/version/${encodeURIComponent(version)}`,
      ),
    path: `${projectDomainBasePath}/task/:entityName/version/:entityVersion`,
  };

  // Executions
  ExecutionDetails = {
    makeUrl: ({ domain, name, project }: WorkflowExecutionIdentifier) =>
      makeProjectDomainBoundPath(project, domain, `/executions/${name}`),
    path: `${projectDomainBasePath}/executions/:executionId`,
  };

  // TLM
  ExecutionTaskDetails = {
    makeUrl: ({
      taskId,
      nodeExecutionId,
      retryAttempt,
      mappedIndex,
      mappedAttempt,
      viewName = TaskExecutionTabEnum.resources,
    }: TaskExecutionIdentifierRoute) => {
      const { project, domain, name } = nodeExecutionId.executionId;

      const tlmPath =
        checkIsNumber(mappedIndex) && checkIsNumber(mappedAttempt)
          ? `/executions/${name}/nodeId/${nodeExecutionId.nodeId}/taskId/${taskId.name}/attempt/${retryAttempt}/mappedIndex/${mappedIndex}/mappedAttempt/${mappedAttempt}/view/${viewName}`
          : `/executions/${name}/nodeId/${nodeExecutionId.nodeId}/taskId/${taskId.name}/attempt/${retryAttempt}/view/${viewName}`;

      return makeProjectDomainBoundPath(project, domain, tlmPath);
    },
    path: `${projectDomainBasePath}/executions/:executionId/nodeId/:nodeId/taskId/:taskId/attempt/:attemptId/(mappedIndex)?/:mappedIndex?/(mappedAttempt)?/:mappedAttempt?/(phase)?/:phase?/view/:viewName`,
  };
}

const Routes = new RoutesConfig();

export { Routes };
