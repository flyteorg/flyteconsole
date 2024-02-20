import React, { useMemo } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import styled from '@mui/system/styled';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { useQueryClient } from 'react-query';
import { makeListDescriptionEntitiesQuery } from '@clients/oss-console/queries/descriptionEntitiesQuery';
import { executionSortFields } from '../../models/Execution/constants';
import { makeListLaunchPlansQuery } from '../../queries/launchPlanQueries';
import { LocalCacheItem, useLocalCache } from '../../basics/LocalCache';
import {
  getScheduleFrequencyString,
  getScheduleOffsetString,
  formatDateUTC,
} from '../../common/formatters';
import { timestampToDate } from '../../common/utils';
import { useCommonStyles } from '../common/styles';
import { ResourceIdentifier, ResourceType } from '../../models/Common/types';
import { LaunchPlan } from '../../models/Launch/types';
import { entityStrings } from './constants';
import t, { patternKey } from './strings';

import { LaunchPlanLastNExecutions } from '../LaunchPlan/components/LaunchPlanLastNExecutions';
import { LaunchPlanNextPotentialExecution } from '../LaunchPlan/components/LaunchPlanNextPotentialExecution';
import { ScheduleDisplayValue, ScheduleStatus } from '../LaunchPlan/components/LaunchPlanCells';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { WaitForQuery } from '../common/WaitForQuery';
import { executionFilterGenerator } from './generators';

const EntitySchedulesContainer = styled('div')(({ theme }) => ({
  '.header': {
    marginBottom: theme.spacing(1),
  },
  '.schedulesContainer': {
    marginTop: theme.spacing(1),
  },
  '.divider': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
  },
  '.rowCell': {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
}));

export const getScheduleStringFromLaunchPlan = (launchPlan: LaunchPlan) => {
  const { schedule } = launchPlan.spec.entityMetadata;
  const frequencyString = getScheduleFrequencyString(schedule);
  const offsetString = getScheduleOffsetString(schedule);
  const scheduleString = offsetString
    ? `${frequencyString} (offset by ${offsetString})`
    : frequencyString;

  return scheduleString;
};

const RenderSchedules: React.FC<{
  launchPlans: LaunchPlan[];
  refetch: () => void;
}> = ({ launchPlans, refetch }) => {
  return (
    <Table size="small" sx={{ margin: '10px 0' }}>
      <TableHead>
        <TableRow>
          <TableCell>
            <Typography variant="h3">{t(patternKey('launchPlan', 'status'))}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h3">{t(patternKey('launchPlan', 'schedule'))}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h3">{t(patternKey('launchPlan', 'lastExecution'))}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h3">
              {t(patternKey('launchPlan', 'nextPotentialExecution'))}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h3">{t(patternKey('launchPlan', 'createdAt'))}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h3">{t(patternKey('launchPlan', 'scheduledVersion'))}</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {launchPlans.map((launchPlan) => {
          const createdAt = launchPlan?.closure?.createdAt!;
          const createdAtTime = formatDateUTC(timestampToDate(createdAt));

          return (
            <TableRow key={launchPlan.id.name}>
              <TableCell className="rowCell">
                <ScheduleStatus launchPlan={launchPlan} refetch={refetch} />
              </TableCell>
              <TableCell className="rowCell">
                <ScheduleDisplayValue launchPlan={launchPlan} />
              </TableCell>
              <TableCell className="rowCell">
                <LaunchPlanLastNExecutions launchPlan={launchPlan} showLastExecutionOnly inView />
              </TableCell>
              <TableCell className="rowCell">
                <LaunchPlanNextPotentialExecution launchPlan={launchPlan} />
              </TableCell>
              <TableCell className="rowCell">{createdAtTime}</TableCell>
              <TableCell className="rowCell">{launchPlan.id.version}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const sort = {
  key: executionSortFields.createdAt,
  direction: SortDirection.DESCENDING,
};
export const EntitySchedules: React.FC<{
  id: ResourceIdentifier;
}> = ({ id }) => {
  const queryClient = useQueryClient();
  const commonStyles = useCommonStyles();
  const [showTable, setShowTable] = useLocalCache(LocalCacheItem.ShowLaunchplanSchedules);

  const { domain, project } = id || {};

  // capture if we are on a launch plan details page page
  const isLaunchPlan = id.resourceType === ResourceType.LAUNCH_PLAN;

  // if not on a launch plan details page, get the latest version of the entity(workflow)
  const workflowEntityDescriptionQuery = useConditionalQuery(
    {
      enabled: !isLaunchPlan,
      ...makeListDescriptionEntitiesQuery(queryClient, { ...id, version: '' }, { sort, limit: 1 }),
    },
    (prev) => !prev && !!showTable,
  );

  // get the latest version of the workflow
  const latestVersionId = workflowEntityDescriptionQuery.data?.entities?.[0]?.id;

  // get the filters for the latestVersionId
  const filter = latestVersionId
    ? executionFilterGenerator[latestVersionId.resourceType!](
        latestVersionId as any,
        latestVersionId?.version,
      )
    : undefined;

  // if the ID is a launchPlan, use the original ID, otherwise use the workflow latest version ID
  const launchPlanRequestId = isLaunchPlan ? id : latestVersionId && { domain, project };
  const launchPlanQuery = useConditionalQuery(
    {
      enabled: !!launchPlanRequestId,
      ...makeListLaunchPlansQuery(queryClient, launchPlanRequestId!, {
        sort,
        limit: 1,
        ...(isLaunchPlan ? {} : { filter }),
      }),
    },
    (prev) => !prev && !!showTable,
  );

  return (
    <WaitForQuery query={launchPlanQuery}>
      {(data) => {
        const launchPlans = data.entities;
        const isSchedulePresent = launchPlans?.[0]?.spec?.entityMetadata?.schedule != null;
        return isSchedulePresent ? (
          <EntitySchedulesContainer>
            <Grid container item alignSelf="center" justifyContent="space-between">
              <Grid item xs={8}>
                <Grid
                  container
                  onClick={() => setShowTable(!showTable)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="pointer"
                >
                  <Grid item>
                    <IconButton
                      size="small"
                      disableRipple
                      disableTouchRipple
                      title={t('collapseButton', showTable)}
                    >
                      {showTable ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Grid>
                  <Grid item alignSelf="center">
                    <Typography variant="h3">{t('schedulesHeader')}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {showTable ? (
              <div className="schedulesContainer">
                {launchPlans.length > 0 ? (
                  <RenderSchedules launchPlans={launchPlans} refetch={launchPlanQuery.refetch} />
                ) : (
                  <Typography variant="body2" className={commonStyles.hintText}>
                    {t(patternKey('noSchedules', entityStrings[id.resourceType]))}
                  </Typography>
                )}
              </div>
            ) : (
              <Divider />
            )}
          </EntitySchedulesContainer>
        ) : null;
      }}
    </WaitForQuery>
  );
};
