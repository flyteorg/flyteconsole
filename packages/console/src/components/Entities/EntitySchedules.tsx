import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import {
  getScheduleFrequencyString,
  getScheduleOffsetString,
} from 'common/formatters';
import { useCommonStyles } from 'components/common/styles';
import { WaitForData } from 'components/common/WaitForData';
import { useWorkflowSchedules } from 'components/hooks/useWorkflowSchedules';
import { ResourceIdentifier } from 'models/Common/types';
import { identifierToString } from 'models/Common/utils';
import { LaunchPlan } from 'models/Launch/types';
import * as React from 'react';
import { LaunchPlanLink } from 'components/LaunchPlan/LaunchPlanLink';
import { entityStrings } from './constants';
import t, { patternKey } from './strings';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(1),
  },
  schedulesContainer: {
    marginTop: theme.spacing(1),
  },
  divider: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
  },
  headCell: {
    color: theme.palette.grey[400],
  },
}));

const RenderSchedules: React.FC<{
  launchPlans: LaunchPlan[];
}> = ({ launchPlans }) => {
  const styles = useStyles();
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography className={styles.headCell} variant="h4">
                {t(patternKey('launchPlan', 'frequency'))}
              </Typography>
            </TableCell>
            <TableCell className={styles.headCell}>
              <Typography className={styles.headCell} variant="h4">
                {t(patternKey('launchPlan', 'name'))}
              </Typography>
            </TableCell>
            <TableCell className={styles.headCell}>
              <Typography className={styles.headCell} variant="h4">
                {t(patternKey('launchPlan', 'version'))}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {launchPlans.map(launchPlan => {
            const { schedule } = launchPlan.spec.entityMetadata;
            const frequencyString = getScheduleFrequencyString(schedule);
            const offsetString = getScheduleOffsetString(schedule);
            const scheduleString = offsetString
              ? `${frequencyString} (offset by ${offsetString})`
              : frequencyString;

            return (
              <TableRow key={launchPlan.id.name}>
                <TableCell>{scheduleString}</TableCell>
                <TableCell>
                  <LaunchPlanLink id={launchPlan.id} color="disabled">
                    {launchPlan.id.name}
                  </LaunchPlanLink>
                </TableCell>
                <TableCell>{launchPlan.id.version}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const EntitySchedules: React.FC<{
  id: ResourceIdentifier;
}> = ({ id }) => {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const scheduledLaunchPlans = useWorkflowSchedules(id);
  return (
    <>
      <WaitForData {...scheduledLaunchPlans} spinnerVariant="none">
        <Typography className={styles.header} variant="h3">
          {t('schedulesHeader')}
        </Typography>
        <div className={styles.divider} />

        <div className={styles.schedulesContainer}>
          {scheduledLaunchPlans.value.length > 0 ? (
            <RenderSchedules launchPlans={scheduledLaunchPlans.value} />
          ) : (
            <Typography variant="body2" className={commonStyles.hintText}>
              {t(patternKey('noSchedules', entityStrings[id.resourceType]))}
            </Typography>
          )}
        </div>
      </WaitForData>
    </>
  );
};
