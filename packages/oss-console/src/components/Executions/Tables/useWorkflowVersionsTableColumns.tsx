import Typography from '@mui/material/Typography';
import moment from 'moment';
import React, { useMemo } from 'react';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import { formatDateUTC } from '../../../common/formatters';
import { padExecutionPaths, padExecutions, timestampToDate } from '../../../common/utils';
import { WaitForData } from '../../common/WaitForData';
import ProjectStatusBar from '../../ListProjectEntities/ProjectStatusBar';
import { useWorkflowVersionsColumnStyles } from './styles';
import { WorkflowVersionColumnDefinition } from './types';
import { ResourceType } from '../../../models/Common/types';
import { useLatestActiveLaunchPlan } from '../../LaunchPlan/hooks/useLatestActiveLaunchPlan';
import { StatusBadge } from '../StatusBadge';
import { ActiveLaunchPlanDisplayValueEnum } from '../../LaunchPlan/components/LaunchPlanCells';

/**
 * Returns a memoized list of column definitions to use when rendering a
 * `WorkflowVersionRow`. Memoization is based on common/column style objects
 * and any fields in the incoming `WorkflowExecutionColumnOptions` object.
 */

export function useWorkflowVersionsTableColumns(): WorkflowVersionColumnDefinition[] {
  const styles = useWorkflowVersionsColumnStyles();
  return React.useMemo(
    () => [
      {
        cellRenderer: ({ workflow: { id } }) => {
          const { version } = id;
          const isLaunchPlan = id.resourceType === ResourceType.LAUNCH_PLAN;

          const activeScheduleLaunchPlanQuery = useLatestActiveLaunchPlan({
            id,
            enabled: isLaunchPlan,
          });

          const activeScheduleLaunchPlan = useMemo(() => {
            return activeScheduleLaunchPlanQuery.data?.entities?.[0];
          }, [activeScheduleLaunchPlanQuery]);

          const isActiveVersion =
            isLaunchPlan &&
            activeScheduleLaunchPlan &&
            activeScheduleLaunchPlan.id.version === version;
          const versionText = version;
          return (
            <Grid container flex="1 0 auto" flexWrap="nowrap" gap={1}>
              <Grid
                item
                flexGrow={1}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <Typography
                  variant="body1"
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {versionText}
                </Typography>
              </Grid>
              {isActiveVersion && (
                <Grid item flexGrow={0} textAlign="right" display="flex" gap={1}>
                  <StatusBadge
                    text={ActiveLaunchPlanDisplayValueEnum.ACTIVE}
                    className="background-status-succeeded launchPlan"
                  ></StatusBadge>
                </Grid>
              )}
            </Grid>
          );
        },
        className: styles.columnName,
        key: 'name',
        label: 'version id',
      },
      {
        cellRenderer: ({ workflow: { closure } }) => {
          if (!closure?.createdAt) {
            return '';
          }
          const createdAtDate = timestampToDate(closure.createdAt);
          return <Typography variant="body1">{formatDateUTC(createdAtDate)}</Typography>;
        },
        className: styles.columnCreatedAt,
        key: 'createdAt',
        label: 'time created',
      },
      {
        cellRenderer: ({ executions }) => {
          return (
            <WaitForData {...executions}>
              <Typography variant="body1">
                {executions.value.length
                  ? moment(timestampToDate(executions.value[0].closure.createdAt)).fromNow()
                  : ''}
              </Typography>
            </WaitForData>
          );
        },
        className: styles.columnLastRun,
        key: 'lastExecution',
        label: 'last execution',
      },
      {
        cellRenderer: ({ executions }) => {
          return (
            <WaitForData {...executions}>
              <ProjectStatusBar
                items={padExecutions(
                  executions.value.map((execution) => execution.closure.phase) || [],
                )}
                paths={padExecutionPaths(executions.value.map((execution) => execution.id) || [])}
              />
            </WaitForData>
          );
        },
        className: styles.columnRecentRun,
        key: 'recentRun',
        label: 'recent run',
      },
    ],
    [styles],
  );
}
