import React from 'react';
import classnames from 'classnames';
import { Link as RouterLink } from 'react-router-dom';
import { useCommonStyles } from '../../common/styles';
import { WorkflowExecutionIdentifier } from '../../../models/Execution/types';
import { Routes } from '../../../routes/routes';
import { history } from '../../../routes/history';

/** A simple component to render a link to a specific WorkflowExecution */
export const WorkflowExecutionLink: React.FC<{
  className?: string;
  color?: 'primary' | 'disabled';
  id: WorkflowExecutionIdentifier;
}> = ({ className, color = 'primary', id }) => {
  const commonStyles = useCommonStyles();
  const {
    location: { pathname, hash, search },
  } = history;
  const fromExecutionNav = pathname.split('/').pop() === 'executions';

  const linkColor = color === 'disabled' ? commonStyles.secondaryLink : commonStyles.primaryLink;

  // preserve router deep link state
  const backLink = pathname + search + hash;

  return (
    <RouterLink
      className={classnames(linkColor, className)}
      to={{
        pathname: `${Routes.ExecutionDetails.makeUrl(id)}`,
        search: fromExecutionNav ? '?fromExecutionNav=true' : '',
        state: { backLink },
      }}
    >
      {id.name}
    </RouterLink>
  );
};
