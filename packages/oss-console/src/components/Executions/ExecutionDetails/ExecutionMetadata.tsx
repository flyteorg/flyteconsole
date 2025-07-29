import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import classnames from 'classnames';
import { Link as RouterLink } from 'react-router-dom';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { dashedValueString } from '@clients/common/constants';
import { formatDateUTC, protobufDurationToHMS } from '../../../common/formatters';
import { timestampToDate } from '../../../common/utils';
import { useCommonStyles } from '../../common/styles';
import { Routes } from '../../../routes/routes';
import { ExecutionContext } from '../contexts';
import { ExpandableExecutionError } from '../Tables/ExpandableExecutionError';
import { ExecutionMetadataLabels } from './constants';
import { ExecutionMetadataExtra } from './ExecutionMetadataExtra';
import { ExecutionLabels } from './ExecutionLabels';

const StyledContainer = styled('div')(({ theme }) => {
  return {
    background: CommonStylesConstants.secondaryBackgroundColor,
    width: '100%',
    '& .detailsContainer': {
      display: 'flex',
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(2),
      marginTop: 0,
    },
    '& .detailItem': {
      marginLeft: theme.spacing(4),
    },
    '& .expandCollapseButton': {
      transition: 'transform 0s linear',
      transform: 'rotate(0deg)',
      '&.expanded': {
        transform: 'rotate(180deg)',
      },
    },
    '& .expandCollapseContainer': {
      bottom: 0,
      position: 'absolute',
      right: theme.spacing(2),
      transform: 'translateY(100%)',
      zIndex: 1,
    },
    '& .version': {
      flex: '0 1 auto',
      overflow: 'hidden',
    },
  };
});

interface DetailItem {
  className?: string;
  label: ExecutionMetadataLabels;
  value: React.ReactNode;
}

/** Renders metadata details about a given Execution */
export const ExecutionMetadata: React.FC<{}> = () => {
  const commonStyles = useCommonStyles();

  const { execution } = React.useContext(ExecutionContext);

  const { domain } = execution.id;

  const abortMetadata = execution?.closure?.abortMetadata;
  const duration = execution?.closure?.duration;
  const error = execution?.closure?.error;
  const startedAt = execution?.closure?.startedAt;
  const workflowId = execution?.closure?.workflowId;

  const { labels } = execution.spec;
  const { referenceExecution, systemMetadata, parentNodeExecution, principal } = execution.spec.metadata;
  const cluster = systemMetadata?.executionCluster ?? dashedValueString;

  const details: DetailItem[] = [
    { label: ExecutionMetadataLabels.domain, value: domain },
    {
      className: 'version',
      label: ExecutionMetadataLabels.version,
      value: workflowId.version,
    },
    {
      label: ExecutionMetadataLabels.cluster,
      value: cluster,
    },
    {
      label: ExecutionMetadataLabels.principal,
      value: principal || dashedValueString,
    },
    {
      label: ExecutionMetadataLabels.time,
      value: startedAt ? formatDateUTC(timestampToDate(startedAt)) : dashedValueString,
    },
    {
      label: ExecutionMetadataLabels.duration,
      value: duration ? protobufDurationToHMS(duration) : dashedValueString,
    },
  ];

  if (referenceExecution != null) {
    details.push({
      label: ExecutionMetadataLabels.relatedTo,
      value: (
        <RouterLink
          className={commonStyles.primaryLinks}
          to={Routes.ExecutionDetails.makeUrl(referenceExecution)}
        >
          {referenceExecution.name}
        </RouterLink>
      ),
    });
  }

  if (parentNodeExecution != null && parentNodeExecution.executionId != null) {
    details.push({
      label: ExecutionMetadataLabels.parent,
      value: (
        <RouterLink
          className={commonStyles.primaryLinks}
          to={Routes.ExecutionDetails.makeUrl(parentNodeExecution.executionId)}
        >
          {parentNodeExecution.executionId.name}
        </RouterLink>
      ),
    });
  }

  if (labels != null && labels.values != null) {
    details.push({
      label: ExecutionMetadataLabels.labels,
      value:
        Object.entries(labels.values).length > 0 ? (
          <ExecutionLabels values={labels.values} />
        ) : (
          dashedValueString
        ),
    });
  }

  return (
    <StyledContainer>
      <Grid container className="detailsContainer" spacing={4}>
        {details.map(({ className, label, value }) => (
          <Grid item className={classnames('detailItem', className)} key={label}>
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
          </Grid>
        ))}
        <ExecutionMetadataExtra execution={execution} />
      </Grid>

      {error || abortMetadata ? (
        <ExpandableExecutionError
          abortMetadata={abortMetadata ?? undefined}
          error={error}
          resourceId={execution.id}
        />
      ) : null}
    </StyledContainer>
  );
};
