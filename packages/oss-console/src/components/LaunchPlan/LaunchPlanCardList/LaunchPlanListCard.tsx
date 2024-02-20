import React, { PropsWithChildren, forwardRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import Shimmer from '@clients/primitives/Shimmer';
import LaunchPlansLogo from '@clients/ui-atoms/LaunchPlansLogo';
import { useQueryClient } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { makeListLaunchPlansQuery } from '../../../queries/launchPlanQueries';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import { SearchResult } from '../../common/SearchableList';
import { Routes } from '../../../routes/routes';
import { LaunchPlanLastNExecutions } from '../components/LaunchPlanLastNExecutions';
import { ScheduleDisplayValue, ScheduleStatus, WorkflowName } from '../components/LaunchPlanCells';
import { createHighlightedEntitySearchResult } from '../../common/useSearchableListState';
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

interface CardButtonProps extends Pick<SearchResult<NamedEntity>, 'value' | 'result' | 'content'> {
  inView: boolean;
}

const CardButton: React.FC<CardButtonProps> = ({ value, result, content, inView }) => {
  const { id } = value;

  const launchPlanDetailsUrl = Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name);
  const finalContent = useMemo(() => {
    return result && inView ? createHighlightedEntitySearchResult(result) : content;
  }, [result, content, inView]);

  return (
    <ListItemButton
      sx={{ marginLeft: '-16px', cursor: 'pointer' }}
      alignItems="flex-start"
      href={launchPlanDetailsUrl}
      LinkComponent={forwardRef((props, ref) => {
        return <Link to={props?.href} ref={ref} {...props} />;
      })}
    >
      <Grid container sx={{ paddingBottom: (theme) => theme.spacing(1), flexWrap: 'nowrap' }}>
        <Grid item>
          <LaunchPlansLogo />
        </Grid>
        <Grid item>
          <Typography
            fontWeight={600}
            sx={{
              wordBreak: 'break-all',
            }}
          >
            <span>{finalContent}</span>
          </Typography>
        </Grid>
      </Grid>
    </ListItemButton>
  );
};

interface LaunchPlanListCardProps extends SearchResult<NamedEntity> {}

const LaunchPlanListCard: React.FC<LaunchPlanListCardProps> = ({ value, result, content }) => {
  const queryClient = useQueryClient();
  const [inViewRef, inView] = useInView();
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

  return (
    <Grid
      container
      ref={inViewRef}
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
      <CardButton value={value} result={result} content={content} inView={inView} />
      <CardRow title="Underlying Workflow" isFetched={isFetched}>
        <WorkflowName isFetched={isFetched} launchPlan={launchPlan} />
      </CardRow>
      <CardRow title="Schedule Status" isFetched={isFetched}>
        <ScheduleStatus launchPlan={launchPlan} refetch={launchPlanWorkflowQuery.refetch} />
      </CardRow>
      <CardRow title="Schedule" isFetched={isFetched}>
        <ScheduleDisplayValue launchPlan={launchPlan} />
      </CardRow>
      <CardRow title="Last Execution" isFetched={launchPlan !== undefined}>
        <Box sx={{ paddingLeft: '16px' }}>
          <LaunchPlanLastNExecutions
            launchPlan={launchPlan}
            showLastExecutionOnly
            inView={inView}
          />
        </Box>
      </CardRow>
      <CardRow title="Last 10 Executions" isFetched={launchPlan !== undefined}>
        <Box sx={{ paddingLeft: '16px' }}>
          <LaunchPlanLastNExecutions launchPlan={launchPlan} inView={inView} />
        </Box>
      </CardRow>
    </Grid>
  );
};

export default LaunchPlanListCard;
