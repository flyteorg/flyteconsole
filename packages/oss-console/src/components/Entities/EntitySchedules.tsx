import React from 'react';
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
import keys from 'lodash/keys';
import { FilterOperationName } from '@clients/common/types/adminEntityTypes';
import classnames from 'classnames';
import { LocalCacheItem, useLocalCache } from '../../basics/LocalCache';
import { useCommonStyles } from '../common/styles';
import { FixedRateUnit, ResourceIdentifier } from '../../models/Common/types';
import { LaunchPlan } from '../../models/Launch/types';
import { entityStrings } from './constants';
import t, { patternKey } from './strings';
import { WaitForQuery } from '../common/WaitForQuery';
import { useLatestActiveLaunchPlan } from '../LaunchPlan/hooks/useLatestActiveLaunchPlan';
import {
  LaunchPlanLastRun,
  LaunchPlanName,
  LaunchPlanNextPotentialExecution,
  ScheduleFrequency,
} from './EntitySchedulesCells';

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

export const getRawScheduleStringFromLaunchPlan = (launchPlan?: LaunchPlan) => {
  const { schedule } = launchPlan?.spec?.entityMetadata || {};
  if (schedule?.rate) {
    const unit = schedule?.rate.unit;
    const unitString =
      keys(FixedRateUnit).find((key) => (FixedRateUnit[key as any] as any) === unit) || '';

    return `${schedule?.rate.value}, ${
      unitString.charAt(0).toUpperCase() + unitString.slice(1).toLowerCase()
    }`;
  }
  if (schedule?.cronSchedule) {
    return schedule.cronSchedule.schedule;
  }

  return '';
};

const EntitySchedulesTable: React.FC<{
  id: ResourceIdentifier;
  launchPlans: LaunchPlan[];
}> = ({ id, launchPlans }) => {
  const commonStyles = useCommonStyles();
  const cellClass = classnames('cell', 'header');

  return launchPlans.length > 0 ? (
    <Table size="small" sx={{ margin: '10px 0' }}>
      <TableHead>
        <TableRow>
          <TableCell
            classes={{
              root: cellClass,
            }}
          >
            {t(patternKey('launchPlan', 'scheduleFrequency'))}
          </TableCell>
          <TableCell
            classes={{
              root: cellClass,
            }}
          >
            {t(patternKey('launchPlan', 'name'))}
          </TableCell>
          <TableCell
            classes={{
              root: cellClass,
            }}
          >
            {t(patternKey('launchPlan', 'lastExecution'))}
          </TableCell>
          <TableCell
            classes={{
              root: cellClass,
            }}
          >
            {t(patternKey('launchPlan', 'nextPotentialExecution'))}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {launchPlans.map((launchPlan) => {
          return (
            <TableRow key={launchPlan.id.name}>
              <TableCell className="rowCell">
                <ScheduleFrequency launchPlan={launchPlan} />
              </TableCell>
              <TableCell className="rowCell">
                <LaunchPlanName launchPlan={launchPlan} />
              </TableCell>
              <TableCell className="rowCell">
                <LaunchPlanLastRun launchPlan={launchPlan} />
              </TableCell>
              <TableCell className="rowCell">
                <LaunchPlanNextPotentialExecution launchPlan={launchPlan} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  ) : (
    <Typography variant="body2" className={commonStyles.hintText}>
      {t(patternKey('noSchedules', entityStrings[id.resourceType]))}
    </Typography>
  );
};

export const EntitySchedules: React.FC<{
  id: ResourceIdentifier;
}> = ({ id }) => {
  const [showTable, setShowTable] = useLocalCache(LocalCacheItem.ShowLaunchplanSchedules);

  const latestActiveSchedulesQuery = useLatestActiveLaunchPlan({
    // Don't pass the wf name here, it's already included in the additionalFilters
    id: {
      project: id.project,
      domain: id.domain,
    } as any,
    limit: 5,
    // add the workflow name to the filter
    additionalFilters: [
      {
        key: 'workflow.name',
        operation: FilterOperationName.EQ,
        value: id.name,
      },
    ],
  });

  return (
    <WaitForQuery query={latestActiveSchedulesQuery}>
      {({ entities: launchPlans }) => {
        const isSchedulePresent = !!launchPlans?.length;
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
                <EntitySchedulesTable launchPlans={launchPlans} id={id} />
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
