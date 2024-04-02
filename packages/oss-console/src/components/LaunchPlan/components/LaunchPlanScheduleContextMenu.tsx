import React, { useMemo, useState, MouseEvent } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Shimmer from '@clients/primitives/Shimmer';
import { LaunchPlanState } from '@clients/oss-console/models/Launch/types';
import { ResourceIdentifier } from '../../../models/Common/types';
import { useLatestActiveLaunchPlan } from '../hooks/useLatestActiveLaunchPlan';
import { ChangeScheduleModal } from './ChangeScheduleModal';
import { DeactivateScheduleModal } from './DeactivateScheduleModal';
import { hasAnyEvent } from '../utils';

export interface LaunchPlanScheduleContextMenuProps {
  id: ResourceIdentifier;
}
export const LaunchPlanScheduleContextMenu = ({ id }: LaunchPlanScheduleContextMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isChangeScheduleModalOpen, setIsChangeScheduleModalOpen] = useState(false);
  const [isDeactivateScheduleModalOpen, setIsDeactivateScheduleModalOpen] = useState(false);

  const open = Boolean(anchorEl);

  const activeScheduleLaunchPlanQuery = useLatestActiveLaunchPlan({
    id,
  });

  const activeScheduleLaunchPlan = useMemo(() => {
    return activeScheduleLaunchPlanQuery.data?.entities?.[0];
  }, [activeScheduleLaunchPlanQuery]);

  const handleClickListItem = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const hasSchedule = hasAnyEvent(activeScheduleLaunchPlan);
  const isActive = activeScheduleLaunchPlan?.closure?.state === LaunchPlanState.ACTIVE;

  return activeScheduleLaunchPlanQuery.isFetched ? (
    <>
      {hasSchedule || isActive ? (
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
                <MoreHorizIcon />
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
        </>
      ) : (
        <Grid data-testid="launch-plan-activate">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsChangeScheduleModalOpen(true);
            }}
          >
            Add active launch plan
          </Link>
        </Grid>
      )}
      {id ? (
        <ChangeScheduleModal
          id={id}
          open={isChangeScheduleModalOpen}
          onClose={() => setIsChangeScheduleModalOpen(false)}
          refetch={activeScheduleLaunchPlanQuery.refetch}
        />
      ) : null}
      {activeScheduleLaunchPlan ? (
        <>
          <DeactivateScheduleModal
            activeLaunchPlan={activeScheduleLaunchPlan}
            open={isDeactivateScheduleModalOpen}
            onClose={() => setIsDeactivateScheduleModalOpen(false)}
            refetch={activeScheduleLaunchPlanQuery.refetch}
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
