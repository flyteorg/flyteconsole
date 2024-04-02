import { CREATED_AT_DESCENDING_SORT } from '@clients/oss-console/models/Launch/constants';
import { LaunchPlan } from '@clients/oss-console/models/Launch/types';
import { makeListLaunchPlansQuery } from '@clients/oss-console/queries/launchPlanQueries';
import React, { useMemo, useState, MouseEvent } from 'react';
import { useQueryClient } from 'react-query';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Shimmer from '@clients/primitives/Shimmer';
import MoreVert from '@mui/icons-material/MoreVert';
import { ChangeScheduleModal } from './ChangeScheduleModal';
import { DeactivateScheduleModal } from './DeactivateScheduleModal';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';
import { NamedEntityIdentifier, ResourceIdentifier } from '../../../models/Common/types';
import { getActiveLaunchPlan } from '../hooks/useLatestActiveLaunchPlan';

export interface LaunchPlanScheduleContextMenuFromNamedProps {
  id: NamedEntityIdentifier;
  inView: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}
export const LaunchPlanScheduleContextMenuFromNamedId = ({
  id,
  inView,
  setRefresh,
}: LaunchPlanScheduleContextMenuFromNamedProps) => {
  const queryClient = useQueryClient();
  const onlyActiveLaunchPlanFilter = getActiveLaunchPlan(true);

  const activeLaunchPlanQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, {
        sort: CREATED_AT_DESCENDING_SORT,
        limit: 1,
        filter: [onlyActiveLaunchPlanFilter],
      }),
      enabled: inView,
    },
    (prev) => !prev && !!inView,
  );

  const currentLaunchPlanQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, {
        sort: CREATED_AT_DESCENDING_SORT,
        limit: 1,
      }),
      enabled: inView,
    },
    (prev) => !prev && !!inView,
  );

  const { launchPlan, isLoading, activeLaunchPlan } = useMemo(() => {
    return {
      launchPlan: (currentLaunchPlanQuery.data?.entities || [])[0] as LaunchPlan | undefined,
      isLoading: currentLaunchPlanQuery.isLoading && activeLaunchPlanQuery.isLoading,
      activeLaunchPlan: (activeLaunchPlanQuery.data?.entities || [])[0] as LaunchPlan | undefined,
    };
  }, [currentLaunchPlanQuery, activeLaunchPlanQuery]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isChangeScheduleModalOpen, setIsChangeScheduleModalOpen] = useState(false);
  const [isDeactivateScheduleModalOpen, setIsDeactivateScheduleModalOpen] = useState(false);

  const open = Boolean(anchorEl);

  const handleClickListItem = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return !isLoading && launchPlan !== undefined ? (
    <>
      <List
        data-testid="launch-plan-settings"
        component="nav"
        aria-label="Launch Plan Settings"
        sx={{ bgcolor: 'background.paper', padding: 0, width: '24px' }}
      >
        <ListItemButton
          id="launch-plan-button"
          aria-haspopup="listbox"
          aria-controls="launch-plan-menu"
          aria-label="Launch plan menu"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClickListItem}
          sx={{ padding: 0, borderRadius: 100 }}
        >
          <ListItemIcon>
            <MoreVert />
          </ListItemIcon>
        </ListItemButton>
      </List>
      <Menu
        id="launch-plan-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'launch-plan-button',
          role: 'listbox',
        }}
      >
        <MenuItem
          key="change-schedule"
          onClick={() => {
            setAnchorEl(null);
            setIsChangeScheduleModalOpen(true);
          }}
        >
          Update active launch plan
        </MenuItem>
        <MenuItem
          key="deactivate-schedule"
          onClick={() => {
            setAnchorEl(null);
            setIsDeactivateScheduleModalOpen(true);
          }}
        >
          Deactivate
        </MenuItem>
      </Menu>

      {launchPlan ? (
        <ChangeScheduleModal
          id={launchPlan.id as ResourceIdentifier}
          open={isChangeScheduleModalOpen}
          onClose={() => setIsChangeScheduleModalOpen(false)}
          refetch={() => {
            setRefresh(true);
            currentLaunchPlanQuery.refetch();
          }}
        />
      ) : null}
      {activeLaunchPlan ? (
        <>
          <DeactivateScheduleModal
            activeLaunchPlan={activeLaunchPlan}
            open={isDeactivateScheduleModalOpen}
            onClose={() => setIsDeactivateScheduleModalOpen(false)}
            refetch={() => {
              activeLaunchPlanQuery.refetch();
              setRefresh(true);
            }}
          />
        </>
      ) : null}
    </>
  ) : (
    <Shimmer
      style={{
        minWidth: 24,
      }}
    />
  );
};
