import classnames from 'classnames';
import { useCommonStyles } from '@flyteconsole/ui-atoms';
import { WorkflowExecutionIdentifier, Routes } from '@flyteconsole/components';
import * as React from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

/** A simple component to render a link to a specific WorkflowExecution */
export const WorkflowExecutionLink: React.FC<{
  className?: string;
  color?: 'primary' | 'disabled';
  id: WorkflowExecutionIdentifier;
}> = ({ className, color = 'primary', id }) => {
  const history = useHistory();
  const commonStyles = useCommonStyles();
  const {
    location: { pathname },
  } = history;
  const fromExecutionNav = pathname.split('/').pop() === 'executions';

  const linkColor = color === 'disabled' ? commonStyles.secondaryLink : commonStyles.primaryLink;
  return (
    <RouterLink
      className={classnames(linkColor, className)}
      to={`${Routes.ExecutionDetails.makeUrl(id)}${
        fromExecutionNav ? '?fromExecutionNav=true' : ''
      }`}
    >
      {id.name}
    </RouterLink>
  );
};
