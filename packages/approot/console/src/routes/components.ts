import { ExecutionDetails } from 'components/Executions/ExecutionDetails/ExecutionDetails';
import { NotFound } from '@flyteconsole/components';
import { ProjectDetails } from 'components/Project/ProjectDetails';
import { SelectProject } from 'components/SelectProject/SelectProject';
import { TaskDetails } from 'components/Task/TaskDetails';
import { WorkflowDetails } from 'components/Workflow/WorkflowDetails';
import { LaunchPlanDetails } from 'components/LaunchPlan/LaunchPlanDetails';
import { EntityVersionsDetailsContainer } from 'components/Entities/VersionDetails/EntityVersionDetailsContainer';

export interface ComponentsTypes {
  executionDetails: typeof ExecutionDetails;
  notFound: typeof NotFound;
  projectDetails: typeof ProjectDetails;
  selectProject: typeof SelectProject;
  taskDetails: typeof TaskDetails;
  workflowDetails: typeof WorkflowDetails;
  entityVersionDetails: typeof EntityVersionsDetailsContainer;
  launchPlanDetails: typeof LaunchPlanDetails;
}
/** Indexes the components for each defined route. These are done separately to avoid circular references
 * in components which include the Routes dictionary
 */
// @ts-ignore
export const components: ComponentsTypes = {
  executionDetails: ExecutionDetails,
  notFound: NotFound,
  projectDetails: ProjectDetails,
  selectProject: SelectProject,
  taskDetails: TaskDetails,
  workflowDetails: WorkflowDetails,
  entityVersionDetails: EntityVersionsDetailsContainer,
  launchPlanDetails: LaunchPlanDetails,
};
