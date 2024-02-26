import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import withRouteParams from '../common/withRouteParams';
import { EntityDetails } from '../Entities/EntityDetails';
import { ResourceIdentifier, ResourceType } from '../../models/Common/types';

export interface TaskDetailsRouteParams {
  projectId: string;
  domainId: string;
  taskName: string;
}
export type TaskDetailsProps = TaskDetailsRouteParams;

/** The view component for the Task landing page */
export const TaskDetailsContainer: React.FC<TaskDetailsRouteParams> = ({
  projectId,
  domainId,
  taskName,
}) => {
  const id = React.useMemo<ResourceIdentifier>(
    () => ({
      resourceType: ResourceType.TASK,
      project: projectId,
      domain: domainId,
      name: taskName,
    }),
    [projectId, domainId, taskName],
  );
  return <EntityDetails id={id} />;
};

export const TaskDetails: React.FunctionComponent<RouteComponentProps<TaskDetailsRouteParams>> =
  withRouteParams<TaskDetailsRouteParams>(TaskDetailsContainer);

export default TaskDetails;
