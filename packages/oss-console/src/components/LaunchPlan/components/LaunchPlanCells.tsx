import Shimmer from '@clients/primitives/Shimmer';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import React, { ChangeEvent, forwardRef, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LaunchPlansLogo from '@clients/ui-atoms/LaunchPlansLogo';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useMutation } from 'react-query';
import { LaunchPlan, LaunchPlanState } from '../../../models/Launch/types';
import { updateLaunchPlan } from '../../../models/Launch/api';
import { NamedEntity } from '../../../models/Common/types';
import {
  SearchResult,
  createHighlightedEntitySearchResult,
} from '../../common/useSearchableListState';
import { Routes } from '../../../routes/routes';

import { getScheduleStringFromLaunchPlan } from '../../Entities/EntitySchedules';
import t from '../../common/strings';

export interface WorkflowNameProps {
  launchPlan?: LaunchPlan;
  isFetched: boolean;
}

export const WorkflowName = ({ launchPlan, isFetched }: WorkflowNameProps) => {
  if (!isFetched || launchPlan == null) {
    return <Shimmer />;
  }
  return (
    <Tooltip title={launchPlan.spec.workflowId.name}>
      <ListItemButton
        href={Routes.WorkflowDetails.makeUrl(
          launchPlan.id.project,
          launchPlan.id.domain,
          launchPlan.spec.workflowId.name,
        )}
        LinkComponent={forwardRef((props, ref) => {
          return <Link to={props?.href} ref={ref} {...props} />;
        })}
      >
        <Box
          sx={{
            // text wrap
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {launchPlan.spec.workflowId.name}
        </Box>
      </ListItemButton>
    </Tooltip>
  );
};

interface LaunchPlanNameProps
  extends Pick<SearchResult<NamedEntity>, 'value' | 'result' | 'content'> {
  inView: boolean;
}
/**
 * Renders individual searchable launchPlan item
 * @param searchResult
 * @returns
 */

export const LaunchPlanName: React.FC<LaunchPlanNameProps> = ({
  result,
  value,
  content,
  inView,
}) => {
  const { id } = value;

  const url = Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name);
  const finalContent = useMemo(() => {
    return result && inView ? createHighlightedEntitySearchResult(result) : content;
  }, [result, content, inView]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Tooltip title={content}>
          <ListItemButton
            href={url}
            LinkComponent={forwardRef((props, ref) => {
              return <Link to={props?.href} ref={ref} {...props} />;
            })}
            sx={{
              minHeight: '49.5px',
              marginLeft: (theme) => theme.spacing(2),
              marginRight: (theme) => theme.spacing(2),
              padding: (theme) => theme.spacing(1, 2),
              marginBottom: '-1px',
            }}
          >
            <Grid container>
              <Grid item sx={{ height: '24px', paddingRight: (theme) => theme.spacing(2) }}>
                <Icon
                  sx={{
                    '& svg': {
                      color: (theme) => theme.palette.common.grays[40],
                      width: '20px',
                    },
                  }}
                >
                  <LaunchPlansLogo />
                </Icon>
              </Grid>
              <Grid
                item
                alignSelf="center"
                sx={{
                  width: (theme) => `calc(100% - 24px - ${theme.spacing(2)})`,
                  // text wrap
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                <span>{finalContent}</span>
              </Grid>
            </Grid>
          </ListItemButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};
export interface ScheduleStatusProps {
  launchPlan?: LaunchPlan;
  refetch: () => void;
}
export const enum ScheduleDisplayValueEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}
export const ScheduleStatus = ({ launchPlan, refetch }: ScheduleStatusProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isActive, setIsActive] = useState<boolean>();
  const [displayValue, setDisplayValue] = useState(t('noValue'));

  useEffect(() => {
    if (
      launchPlan?.spec.entityMetadata?.schedule?.cronSchedule !== undefined &&
      launchPlan?.closure?.state !== undefined
    ) {
      if (launchPlan.closure.state === LaunchPlanState.ACTIVE) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }
  }, [launchPlan]);

  useEffect(() => {
    if (
      launchPlan?.spec.entityMetadata?.schedule?.cronSchedule !== undefined &&
      launchPlan?.closure?.state !== undefined
    ) {
      if (isActive) {
        setDisplayValue(ScheduleDisplayValueEnum.ACTIVE);
      } else {
        setDisplayValue(ScheduleDisplayValueEnum.INACTIVE);
      }
    }
  }, [isActive]);

  const mutation = useMutation(
    (newState: LaunchPlanState) => updateLaunchPlan(launchPlan?.id, newState),
    {
      onMutate: () => setIsUpdating(true),
      onSuccess: () => {
        setIsUpdating(false);
      },
      onSettled: () => {
        setIsUpdating(false);
      },
    },
  );

  useEffect(() => {
    if (mutation.isSuccess) {
      refetch?.();
    }
  }, [mutation.isSuccess]);

  const handleScheduleStatusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    mutation.mutate(checked ? LaunchPlanState.ACTIVE : LaunchPlanState.INACTIVE);
    setIsActive(checked);
  };

  return !launchPlan || isUpdating ? (
    <Shimmer />
  ) : (
    <Grid item xs={12} sm="auto" alignSelf="center" justifySelf="flex-end">
      <Box pl={2}>
        {displayValue === '-' ? (
          '-'
        ) : (
          <FormControlLabel
            control={<Switch checked={isActive} />}
            label={displayValue}
            onChange={(event) => {
              handleScheduleStatusChange(event as ChangeEvent<HTMLInputElement>);
            }}
          />
        )}
      </Box>
    </Grid>
  );
};
export interface ScheduleDisplayValueProps {
  launchPlan?: LaunchPlan;
}
export const ScheduleDisplayValue = ({ launchPlan }: ScheduleDisplayValueProps) => {
  const scheduleDisplayValue = useMemo(() => {
    if (!launchPlan) {
      return t('noValue');
    }
    let scheduleDisplayValue = getScheduleStringFromLaunchPlan(launchPlan);
    if (scheduleDisplayValue === '') {
      scheduleDisplayValue = t('noValue');
    }
    return scheduleDisplayValue;
  }, [launchPlan]);

  if (launchPlan === undefined) {
    return <Shimmer />;
  }
  return (
    <Tooltip title={scheduleDisplayValue}>
      <Grid item xs={12} sm="auto" alignSelf="center" justifySelf="flex-end">
        <Box pl={2}>{scheduleDisplayValue}</Box>
      </Grid>
    </Tooltip>
  );
};
