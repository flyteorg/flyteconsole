import classnames from 'classnames';
import { useCommonStyles } from 'components/common/styles';
import { LaunchPlanId } from 'models/Launch/types';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Routes } from 'routes/routes';

/** A simple component to render a link to a specific LaunchPlan */
export const LaunchPlanLink: React.FC<{
  className?: string;
  color?: 'primary' | 'disabled';
  id: LaunchPlanId;
}> = ({ className, color = 'primary', id }) => {
  const commonStyles = useCommonStyles();
  const linkColor =
    color === 'disabled'
      ? commonStyles.secondaryLink
      : commonStyles.primaryLink;
  return (
    <RouterLink
      className={classnames(linkColor, className)}
      to={`${Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name)}`}
    >
      {id.name}
    </RouterLink>
  );
};
