import React from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import UnarchiveOutline from '@mui/icons-material/UnarchiveOutlined';
import LaunchPlanIcon from '@mui/icons-material/AssignmentOutlined';
import moment from 'moment';
import { useQueryClient } from 'react-query';
import ArchiveLogo from '@clients/ui-atoms/ArchiveLogo';
import { HoverTooltip } from '@clients/primitives/HoverTooltip';
import Shimmer from '@clients/primitives/Shimmer';
import styled from '@mui/system/styled';
import {
  formatDateLocalTimezone,
  formatDateUTC,
  formateDateRelative,
  millisecondsToHMS,
} from '../../../../common/formatters';
import { timestampToDate } from '../../../../common/utils';
import { ExecutionStatusBadge } from '../../ExecutionStatusBadge';
import { Execution } from '../../../../models/Execution/types';
import { ExecutionState, WorkflowExecutionPhase } from '../../../../models/Execution/enums';
import { Routes } from '../../../../routes/routes';
import { getScheduleStringFromLaunchPlan } from '../../../Entities/EntitySchedules';
import { WorkflowExecutionsTableState } from '../types';
import { getWorkflowExecutionTimingMS, isExecutionArchived } from '../../utils';
import t from './strings';
import { useConditionalQuery } from '../../../hooks/useConditionalQuery';
import { makeLaunchPlanQuery } from '../../../../queries/launchPlanQueries';

const StyledExecutionIdCellButton = styled(Button)(() => ({
  fontWeight: 700,
}));
export function getExecutionIdCell(execution: Execution): React.ReactNode {
  const isArchived = isExecutionArchived(execution);
  const { id } = execution;

  const url = Routes.ExecutionDetails.makeUrl(id);

  return (
    <HoverTooltip title={id.name}>
      <StyledExecutionIdCellButton
        onClick={(e) => e.stopPropagation()}
        disabled={isArchived}
        color="info"
        variant="text"
        href={url}
        LinkComponent={React.forwardRef((props, ref) => {
          return <Link ref={ref} {...props} variant="body2" />;
        })}
      >
        {id.name}
      </StyledExecutionIdCellButton>
    </HoverTooltip>
  );
}

export function getStatusCell(execution: Execution): React.ReactNode {
  const isArchived = isExecutionArchived(execution);
  const phase = execution.closure.phase ?? WorkflowExecutionPhase.UNDEFINED;

  return <ExecutionStatusBadge phase={phase} type="workflow" disabled={isArchived} />;
}

export function getStartTimeCell(
  execution: Execution,
  isRelativeStartTime?: boolean,
): React.ReactNode {
  const startedAt = execution?.closure?.startedAt;

  if (!startedAt) {
    return '—';
  }

  // make timestamp on first render
  const [now] = React.useState<number>(Date.now());

  const startedAtDate = timestampToDate(startedAt);
  const utc = formatDateUTC(startedAtDate);
  // const isArchived = isExecutionArchived(execution);

  if (isRelativeStartTime) {
    return formateDateRelative(startedAtDate);
  }

  const localTime = React.useMemo(() => {
    return formatDateLocalTimezone(startedAtDate);
  }, [startedAtDate]);

  const formatRelativeTime = React.useMemo(() => {
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;

    const delta = now - startedAtDate.valueOf();

    // is the date more than 24 ago
    const isLast24Hours = delta < 24 * hour;

    if (isLast24Hours) {
      const h = Math.floor(delta / hour);
      const m = Math.floor((delta - h * hour) / minute);
      const s = Math.floor((delta - h * hour - m * minute) / second);

      if (delta < minute) {
        return `${s}s ago`;
      }
      if (delta < hour) {
        return `${m}m ${s}s ago`;
      }
      return `${h}h ${m}m ago`;
    }
    return utc;
  }, [startedAtDate, utc]);

  const tooltipText = React.useMemo(() => {
    const isLast24Hours = moment().diff(startedAtDate, 'hours') < 24;

    if (isLast24Hours) {
      return (
        <>
          <div>{formatRelativeTime}</div>
          <div>{localTime}</div>
          <div>{utc}</div>
        </>
      );
    }
    return (
      <>
        <div>{localTime}</div>
        <div>{utc}</div>
      </>
    );
  }, [startedAtDate, localTime]);

  return (
    <HoverTooltip title={tooltipText}>
      <span>{formatRelativeTime}</span>
    </HoverTooltip>
  );
}

export function getDurationCell(execution: Execution): React.ReactNode {
  const isArchived = isExecutionArchived(execution);
  const timing = getWorkflowExecutionTimingMS(execution);

  const value = timing?.duration !== undefined ? millisecondsToHMS(timing.duration) : '';

  return (
    <Typography component="span" variant="body1" color={isArchived ? 'textSecondary' : 'inherit'}>
      {value}
    </Typography>
  );
}

export function getLaunchPlanCell(execution: Execution, _className: string): React.ReactNode {
  const id = execution.spec.launchPlan;

  const url = Routes.EntityDetails.makeUrl({
    ...id,
  });

  return (
    <HoverTooltip title={id.name}>
      <Link
        href={url}
        variant="body2"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {id.name}
      </Link>
    </HoverTooltip>
  );
}

export function getWorkflowTaskCell(execution: Execution): React.ReactNode {
  const id = execution.closure.workflowId;

  const url = Routes.EntityDetails.makeUrl(id);

  return (
    <HoverTooltip title={id.name}>
      <Link
        href={url}
        variant="body2"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {id.name}
      </Link>
    </HoverTooltip>
  );
}

export function getScheduleCell(execution: Execution): React.ReactNode {
  const isEnabled = !!execution.spec.metadata.scheduledAt;
  const queryClient = useQueryClient();
  const lpQuery = useConditionalQuery(
    { ...makeLaunchPlanQuery(queryClient, execution.spec.launchPlan), enabled: isEnabled },
    (prev) => !!prev,
  );

  const launchPlan = React.useMemo(() => {
    return lpQuery.data ?? null;
  }, [lpQuery.data]);

  const schedule = React.useMemo(() => {
    if (!launchPlan) {
      return '';
    }
    if (!launchPlan.spec.entityMetadata.schedule) {
      return '';
    }
    return getScheduleStringFromLaunchPlan(launchPlan);
  }, [launchPlan, launchPlan?.spec.entityMetadata.schedule]);

  if (lpQuery.isLoading) {
    return <Shimmer />;
  }

  if (!launchPlan) {
    return '—';
  }

  return (
    <HoverTooltip title={schedule}>
      <span>{schedule}</span>
    </HoverTooltip>
  );
}

/**
 * Version of Task / Workflow invoked by the launch plan used by the execution
 * @param execution
 * @returns
 */
export function getVersionCell(execution: Execution): React.ReactNode {
  const launchPlanId = execution.closure.workflowId;
  const { version } = launchPlanId;
  const url = Routes.EntityVersionDetails.makeUrl(launchPlanId);

  return (
    <HoverTooltip title={version}>
      <Link
        href={url}
        variant="body2"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {version}
      </Link>
    </HoverTooltip>
  );
}

export const showOnHoverClass = 'showOnHover';
export function getActionsCell(
  execution: Execution,
  state: WorkflowExecutionsTableState,
  showLaunchPlan: boolean,
  wrapperClassName: string,
  iconClassName: string,
  onArchiveClick?: () => void, // (newState: ExecutionState) => void,
): React.ReactNode {
  const isArchived = isExecutionArchived(execution);
  const onClick = () => state.setSelectedIOExecution(execution);

  const getArchiveIcon = (isArchived: boolean) =>
    isArchived ? <UnarchiveOutline /> : <ArchiveLogo />;

  return (
    <Box
      width={140}
      display="flex"
      justifyContent="flex-end"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Button
        size="small"
        color="primary"
        title={t('inputOutputTooltip')}
        className={iconClassName}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        View I/O
      </Button>
      {showLaunchPlan && (
        <IconButton
          size="small"
          title={t('launchPlanTooltip')}
          className={iconClassName}
          onClick={() => {
            /* Not implemented */
          }}
        >
          <LaunchPlanIcon />
        </IconButton>
      )}
      {!!onArchiveClick && (
        <IconButton
          size="small"
          title={t('archiveAction', isArchived)}
          onClick={(e) => {
            e.stopPropagation();

            // local dev mode logging
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.table(execution.id);
              // eslint-disable-next-line no-console
              console.table(execution.spec.launchPlan);
              // eslint-disable-next-line no-console
              console.table(execution.closure.workflowId);
              // eslint-disable-next-line no-console
              console.log(execution);
            }

            onArchiveClick();
          }}
          className={`hidden-button ${showOnHoverClass}`}
          sx={{
            padding: '2px',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            [`tr:hover &`]: {
              opacity: 1,
            },
            [`.${showOnHoverClass} &`]: {
              opacity: 1,
            },
          }}
        >
          {getArchiveIcon(isArchived)}
        </IconButton>
      )}
    </Box>
  );
}

/**
 * ApprovalDooubleCell - represents approval request to Archive/Cancel operation on specific execution
 */
export interface ApprovalDoubleCellProps {
  isArchived: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onConfirmClick: (newState: ExecutionState) => void;
}

export function ApprovalDoubleCell(props: ApprovalDoubleCellProps) {
  const { isArchived, isLoading, onCancel, onConfirmClick } = props;

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  return (
    <>
      <Box width={140} display="flex" justifyContent="flex-end">
        <Button
          size="small"
          color="primary"
          variant="contained"
          disableElevation
          onClick={() =>
            onConfirmClick(
              isArchived ? ExecutionState.EXECUTION_ACTIVE : ExecutionState.EXECUTION_ARCHIVED,
            )
          }
          sx={{
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
          }}
        >
          {t('archiveAction', isArchived)}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disableElevation
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          sx={{
            padding: '3px 9px',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
          }}
        >
          {t('cancelAction')}
        </Button>
      </Box>
    </>
  );
}
