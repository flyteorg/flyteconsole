import { InfiniteQueryObserverOptions, QueryObserverOptions } from 'react-query';

export enum QueryType {
  ExecutionMetrics = 'executionMetrics',

  ListWorkflows = 'listWorkflows',
  Workflow = 'workflow',
  WorkflowExecution = 'workflowExecution',
  WorkflowExecutionList = 'workflowExecutionList',
  WorkflowEntitiesList = 'workflowEntitiesList',
  LaunchPlan = 'launchPlan',
  ListLaunchPlans = 'listLaunchPlans',
  LaunchPlanEntitiesList = 'launchPlanEntitiesList',

  // Node Executions
  NodeExecutionDetails = 'NodeExecutionDetails',
  NodeExecution = 'nodeExecution',
  NodeExecutionList = 'nodeExecutionList',
  NodeExecutionAndChildList = 'nodeExecutionAndChildList',
  NodeExecutionChildList = 'nodeExecutionChildList',
  NodeExecutionTreeList = 'nodeExecutionTreeList',
  NodeExecutionData = 'NodeExecutionData',
  NodeExecutionTasks = 'NodeExecutionTasks',
  NodeExecutionChildren = 'NodeExecutionChildren',
  NodeExecutionAndTasks = 'NodeExecutionAndTasks',

  // Tasks
  Task = 'task',
  TaskExecution = 'taskExecution',
  TaskExecutionData = 'taskExecutionData',
  LatestTaskVersion = 'latestTaskVersion',
  TaskExecutionList = 'taskExecutionList',
  TaskExecutionChildList = 'taskExecutionChildList',
  TaskTemplate = 'taskTemplate',
  TaskEntitiesList = 'taskEntitiesList',

  // Description Entities
  ListDescriptionEntities = 'listDescriptionEntities',
  DescriptionEntity = 'descriptionEntity',
  // Projects
  GetProject = 'getProject',
  ListProjects = 'listProjects',
  ProjectDomainAttributes = 'projectDomainAttributes',
  ProjectAttributes = 'projectAttributes',
}

type QueryKeyArray = [QueryType, ...unknown[]];
export interface QueryInput<T> extends QueryObserverOptions<T, Error> {
  queryKey: QueryKeyArray;
  queryFn: QueryObserverOptions<T, Error>['queryFn'];
}

export interface InfiniteQueryPage<T> {
  data: T[];
  token?: string;
}

export interface InfiniteQueryInput<T>
  extends InfiniteQueryObserverOptions<InfiniteQueryPage<T>, Error> {
  queryKey: QueryKeyArray;
  queryFn: InfiniteQueryObserverOptions<InfiniteQueryPage<T>, Error>['queryFn'];
}
