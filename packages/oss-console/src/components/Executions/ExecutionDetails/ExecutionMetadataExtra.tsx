import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import classnames from 'classnames';
import styled from '@mui/system/styled';
import { dashedValueString } from '@clients/common/constants';
import { useCommonStyles } from '../../common/styles';
import { Execution } from '../../../models/Execution/types';
import { getLaunchPlan } from '../../../models/Launch/api';
import { LaunchPlanSpec } from '../../../models/Launch/types';
import { ExecutionMetadataLabels } from './constants';

const StyledDetailItem = styled(Grid)(() => ({
  flexShrink: 0,
})) as typeof Grid;

interface DetailItem {
  className?: string;
  label: ExecutionMetadataLabels;
  value: React.ReactNode;
}

/**
 * Renders extra metadata details about a given Execution
 * @param execution
 * @constructor
 */
export const ExecutionMetadataExtra: React.FC<{
  execution: Execution;
}> = ({ execution }) => {
  const commonStyles = useCommonStyles();

  const {
    launchPlan: launchPlanId,
    maxParallelism,
    rawOutputDataConfig,
    securityContext,
    interruptible,
    overwriteCache,
  } = execution.spec;

  const [launchPlanSpec, setLaunchPlanSpec] = React.useState<Partial<LaunchPlanSpec>>({});

  React.useEffect(() => {
    getLaunchPlan(launchPlanId).then(({ spec }) => setLaunchPlanSpec(spec));
  }, [launchPlanId]);

  const details: DetailItem[] = [
    {
      label: ExecutionMetadataLabels.iam,
      value: securityContext?.runAs?.iamRole || ExecutionMetadataLabels.securityContextDefault,
    },
    {
      label: ExecutionMetadataLabels.serviceAccount,
      value:
        securityContext?.runAs?.k8sServiceAccount || ExecutionMetadataLabels.securityContextDefault,
    },
    {
      label: ExecutionMetadataLabels.rawOutputPrefix,
      value:
        rawOutputDataConfig?.outputLocationPrefix ||
        launchPlanSpec?.rawOutputDataConfig?.outputLocationPrefix ||
        dashedValueString,
    },
    {
      label: ExecutionMetadataLabels.parallelism,
      value: maxParallelism,
    },
    {
      label: ExecutionMetadataLabels.interruptible,
      value: interruptible ? (interruptible.value ? 'true' : 'false') : dashedValueString,
    },
    {
      label: ExecutionMetadataLabels.overwriteCache,
      value: overwriteCache ? 'true' : 'false',
    },
  ];

  return (
    <>
      {details.map(({ className, label, value }) => (
        <StyledDetailItem item className={classnames(className, 'detailItem')} key={label}>
          <Typography className={commonStyles.truncateText} variant="subtitle1">
            {label}
          </Typography>
          <Typography
            className={commonStyles.truncateText}
            variant="h6"
            data-testid={`metadata-${label}`}
          >
            {value}
          </Typography>
        </StyledDetailItem>
      ))}
    </>
  );
};
