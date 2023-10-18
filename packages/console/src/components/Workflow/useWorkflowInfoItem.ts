import { Core } from '@flyteorg/flyteidl-types';
import { NamedEntityIdentifier, Identifier } from 'models/Common/types';
import { FilterOperationName, SortDirection } from 'models/AdminEntity/types';
import { executionSortFields } from 'models/Execution/constants';
import { WorkflowExecutionIdentifier } from 'models/Execution/types';
import { listExecutions } from 'models/Execution/api';
import { listWorkflows } from 'models/Workflow/api';
import { listLaunchPlans } from 'models/Launch/api';
import { workflowSortFields } from 'models/Workflow/constants';
import Long from 'long';
import { formatDateUTC } from 'common/formatters';
import { timestampToDate } from 'common/utils';
import { useQuery } from 'react-query';
import {
  getInputsForWorkflow,
  getOutputsForWorkflow,
} from '../Launch/LaunchForm/getInputs';

export const useWorkflowInfoItem = ({
  domain,
  project,
  name,
}: NamedEntityIdentifier): {
  data: {
    latestExecutionTime?: any;
    executionStatus?: Core.WorkflowExecution.Phase[] | undefined;
    executionIds?: WorkflowExecutionIdentifier[] | undefined;
    id?: Identifier | undefined;
    inputs?: string | undefined;
    outputs?: string | undefined;
    description?: string | undefined;
  };
  isLoading: boolean;
  error: unknown;
} => {
  const {
    data: executionInfo,
    isLoading: executionLoading,
    error: executionError,
  } = useQuery(
    ['workflow-executions', domain, project, name],
    async () => {
      const { entities: executions } = await listExecutions(
        { domain, project },
        {
          sort: {
            key: executionSortFields.createdAt,
            direction: SortDirection.DESCENDING,
          },
          filter: [
            {
              key: 'workflow.name',
              operation: FilterOperationName.EQ,
              value: name,
            },
          ],
          limit: 10,
        },
      );
      const executionIds = executions.map(execution => execution.id);
      let latestExecutionTime;
      const hasExecutions = executions.length > 0;
      if (hasExecutions) {
        const latestExecution = executions[0].closure.createdAt;
        const timeStamp = {
          nanos: latestExecution.nanos,
          seconds: Long.fromValue(latestExecution.seconds!),
        };
        latestExecutionTime = formatDateUTC(timestampToDate(timeStamp));
      }
      const executionStatus = executions.map(
        execution => execution.closure.phase,
      );
      return {
        latestExecutionTime,
        executionStatus,
        executionIds,
      };
    },
    {
      staleTime: 1000 * 60 * 5,
    },
  );

  const {
    data: workflowInfo,
    isLoading: workflowLoading,
    error: workflowError,
  } = useQuery(
    ['workflow-info', domain, project, name],
    async () => {
      const {
        entities: [workflow],
      } = await listWorkflows(
        { domain, project, name },
        {
          limit: 1,
          sort: {
            key: workflowSortFields.createdAt,
            direction: SortDirection.DESCENDING,
          },
        },
      );
      const { id } = workflow;
      const {
        entities: [launchPlan],
      } = await listLaunchPlans({ domain, project, name }, { limit: 1 });
      const parsedInputs = getInputsForWorkflow(
        workflow,
        launchPlan,
        undefined,
      );
      const inputs =
        parsedInputs.length > 0
          ? parsedInputs.map(input => input.label).join(', ')
          : undefined;
      const parsedOutputs = getOutputsForWorkflow(launchPlan);
      const outputs =
        parsedOutputs.length > 0 ? parsedOutputs.join(', ') : undefined;
      const description =
        workflow?.shortDescription && workflow?.shortDescription.length > 0
          ? workflow.shortDescription
          : undefined;
      return { id, inputs, outputs, description };
    },
    {
      staleTime: 1000 * 60 * 5,
    },
  );

  return {
    data: {
      ...workflowInfo,
      ...executionInfo,
    },
    isLoading: executionLoading || workflowLoading,
    error: executionError ?? workflowError,
  };
};
