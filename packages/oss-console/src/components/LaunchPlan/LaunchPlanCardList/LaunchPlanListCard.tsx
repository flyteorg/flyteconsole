import React, { PropsWithChildren, forwardRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import Shimmer from '@clients/primitives/Shimmer';
import { useQueryClient } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { makeListLaunchPlansQuery } from '../../../queries/launchPlanQueries';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import { SearchResult } from '../../common/SearchableList';
import { Routes } from '../../../routes/routes';
import { LaunchPlanLastNExecutions } from '../components/LaunchPlanLastNExecutions';
import { LaunchPlanName, ScheduleStatusSummary } from '../components/LaunchPlanCells';
import { NamedEntity } from '../../../models/Common/types';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';

const CardRow: React.FC<
  PropsWithChildren<{
    title: string;
    isFetched: boolean;
  }>
> = ({ title, isFetched, children }) => {
  return (
    <Grid
      sx={{ paddingBottom: (theme) => theme.spacing(0.5), display: 'flex', alignItems: 'center' }}
    >
      <Grid item xs={4}>
        <Typography className="itemLabel">{title}</Typography>
      </Grid>
      <Grid item xs={8}>
        {!isFetched ? <Shimmer /> : children}
      </Grid>
    </Grid>
  );
};

interface LaunchPlanListCardProps extends SearchResult<NamedEntity> {}

const LaunchPlanListCard: React.FC<LaunchPlanListCardProps> = ({ value, result, content }) => {
  const queryClient = useQueryClient();
  const [inViewRef, inView] = useInView();

  if (!value) {
    return null;
  }

  const { id } = value;

  const launchPlanWorkflowQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, { sort: CREATED_AT_DESCENDING_SORT, limit: 1 }),
      enabled: inView,
    },
    (prev) => !prev && !!inView,
  );
  const { launchPlan, isFetched } = useMemo(() => {
    const launchPlan = launchPlanWorkflowQuery.data?.entities?.[0];
    return {
      isFetched: launchPlanWorkflowQuery.isFetched,
      launchPlan,
    };
  }, [launchPlanWorkflowQuery]);

  const launchPlanDetailsUrl = Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name);
  return (
    <div ref={inViewRef} data-testid="launch-plan-card">
      <ListItemButton
        data-testid="launch-plan-card-link"
        href={launchPlanDetailsUrl}
        LinkComponent={forwardRef((props, ref) => {
          return <Link to={props?.href} ref={ref} {...props} />;
        })}
        alignItems="flex-start"
        sx={{ marginLeft: '-16px', cursor: 'pointer', padding: (theme) => theme.spacing(0, 2) }}
      >
        <Grid
          container
          sx={{
            minHeight: '400',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            margin: (theme) => theme.spacing(0, 2, 2, 2),
            padding: (theme) => `${theme.spacing(2)} !important`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
          }}
        >
          <LaunchPlanName inView={inView} content={content} value={value} result={result} />

          <CardRow title="Trigger" isFetched={isFetched}>
            <ScheduleStatusSummary id={id} inView={inView} />
          </CardRow>

          <CardRow title="Last Execution" isFetched={launchPlan !== undefined}>
            <Box data-testid="launch-plan-last-execution">
              <LaunchPlanLastNExecutions id={id} showLastExecutionOnly inView={inView} />
            </Box>
          </CardRow>
          <CardRow title="Last 10 Executions" isFetched={launchPlan !== undefined}>
            <Box data-testid="launch-plan-last-10-executions">
              <LaunchPlanLastNExecutions id={id} inView={inView} />
            </Box>
          </CardRow>
        </Grid>
      </ListItemButton>
    </div>
  );
};

export default LaunchPlanListCard;
