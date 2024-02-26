import React, { useMemo, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import styled from '@mui/system/styled';
import { COLOR_SPECTRUM as ColorSpectrum } from '@clients/theme/CommonStyles/colorSpectrum';
import { useQueryClient } from 'react-query';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { BarChart, BarChartData } from './BarChart';
import { getExecutionTimeData, getStartExecutionTime } from '../Entities/EntityExecutionsBarChart';
import t from './strings';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { makeFilterableWorkflowExecutionsQuery } from '../../queries/workflowQueries';
import { NamedEntityIdentifier } from '../../models/Common/types';

const StyledWrapper = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0, 2, 0, 2),
  gap: theme.spacing(1),
  marginBottom: theme.spacing(-2),

  '.collapseButton': {
    marginTop: theme.spacing(-0.5),
  },
  '.domainSettings': {
    padding: theme.spacing(2, 4, 0, 4),
    display: 'flex',
    justifyContent: 'space-between',
  },
  '.title': {
    marginTop: theme.spacing(1),
    paddingBottom: theme.spacing(0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '.subHeader': {
    margin: 0,
    paddingBottom: theme.spacing(2),
    fontSize: '16px',
    fontWeight: 600,
  },
  '.grayText': {
    padding: theme.spacing(1, 0, 1, 0),
    color: ColorSpectrum.gray40.color,
  },
}));

export interface ExecutionsBarChartSectionProps {
  project: string;
  domain: string;
  headerText?: string;
  resourceType?: 'Task' | 'Workflow' | 'Launch Plan' | 'Entity' | 'Project';
  onToggle: (item: BarChartData) => void;
  chartIds: string[];
  requestConfig: RequestConfig;
}

export const ExecutionsBarChartSection = ({
  resourceType = 'Project',
  domain,
  project,
  headerText,
  onToggle,
  chartIds,
  requestConfig,
}: ExecutionsBarChartSectionProps) => {
  const queryClient = useQueryClient();
  const [showChart, setShowChart] = useState(true);
  const subHeadertext = t('last100ExecutionsTitle', resourceType);

  // to show only in bar chart view
  const recentExecutions = useConditionalQuery(
    {
      ...makeFilterableWorkflowExecutionsQuery(
        queryClient,
        { domain, project } as NamedEntityIdentifier,
        requestConfig,
      ),
    },
    (prev) => !prev,
  );

  const handleBarChartItemClick = useCallback((item: BarChartData) => {
    onToggle(item);
  }, []);

  const recentExecutionsData = useMemo(() => {
    return recentExecutions?.data?.entities || [];
  }, [recentExecutions]);
  return (
    <StyledWrapper container className="last-100-executions-section">
      <Grid
        item
        xs={12}
        className="title pointer"
        onClick={() => setShowChart(!showChart)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Grid container alignContent="center">
          <Grid item>
            <IconButton
              size="small"
              disableRipple
              disableTouchRipple
              title={t('collapseButton', showChart)}
            >
              {showChart ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h3">{headerText || t('allExecutionsTitle')}</Typography>
          </Grid>
        </Grid>
      </Grid>
      {showChart && (
        <Grid
          item
          sx={{
            margin: (theme) => theme.spacing(-0.5, -2, 0, -0.5),
            width: (theme) => `calc(100% + ${theme.spacing(2)})`,
          }}
        >
          <BarChart
            title={subHeadertext}
            chartIds={chartIds}
            data={getExecutionTimeData(recentExecutionsData, resourceType as any)}
            startDate={getStartExecutionTime(recentExecutionsData)}
            onClickItem={handleBarChartItemClick}
          />
        </Grid>
      )}
      {!showChart && <Box height={0.75} />}
    </StyledWrapper>
  );
};
