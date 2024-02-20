import React, { MouseEventHandler, useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import get from 'lodash/get';
import LogoutLogo from '@clients/ui-atoms/LogoutLogo';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import { Flyte } from '../types/flyteTypes';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: 'transparent',
  border: `1px solid ${theme.palette.common.blue[1]}`,
  color: theme.palette.common.blue[1],
  cursor: 'pointer',
  width: theme.spacing(4),
  height: theme.spacing(4),
  fontSize: theme.typography.body1.fontSize,
  marginInline: 'auto',
  marginTop: theme.spacing(2),
}));

const AvatarWrapper = styled(Grid)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '4px 0',
});

const UserPopoutItem = styled(Box)(({ theme }) => ({
  display: 'block',

  p: {
    fontSize: '16px',
  },

  '&.withPadding': {
    padding: '6px 16px',
  },

  '.actionButton': {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: 'inherit',
    width: '100%',
    padding: '6px 16px',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'flex-start',
  },

  '.logoutIcon': {
    fill: theme.palette.common.grays[40],
  },
}));

export interface UserProfileProps {
  profile?: Flyte.Profile;
}

/** Displays User name when user is logged in - would be used as User settings entry in future */
export const UserProfile = ({ profile }: UserProfileProps) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const apiContext = useFlyteApi();

  const handlePopoverOpen: MouseEventHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const givenName = React.useMemo(() => {
    if (!profile) {
      return null;
    }

    return profile.name ?? `${profile.givenName} ${profile.familyName}`.trim();
  }, [profile]);

  const userNameInitial = useMemo(() => {
    if (!givenName) {
      return '';
    }
    const names = givenName.split(' ');
    const firstInitial = names[0].charAt(0);
    const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toLocaleUpperCase();
  }, [givenName]);

  const popoverOpen = Boolean(anchorEl);
  const userName =
    profile?.email || profile?.preferredUsername || get(profile, 'preferred_username') || givenName;

  return (
    <>
      <AvatarWrapper item data-pinned-nav-link="avatar" data-cy="pinned-nav-link-avatar">
        <StyledAvatar
          sx={{ bgcolor: 'transparent' }}
          aria-owns="avatar-popover"
          aria-haspopup="true"
          data-cy="username-avatar"
          onClick={handlePopoverOpen}
        >
          {userNameInitial}
        </StyledAvatar>

        <Popover
          open={popoverOpen}
          anchorEl={anchorEl}
          aria-hidden
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Box>
            <UserPopoutItem className="withPadding">
              <Typography variant="body1">{userName}</Typography>
            </UserPopoutItem>

            <Divider />

            <UserPopoutItem>
              <Button
                variant="text"
                color="inherit"
                className="actionButton"
                href={apiContext.getLogoutUrl()}
                data-cy="logout-button"
                startIcon={<LogoutLogo className="logoutIcon" />}
              >
                Sign Out
              </Button>
            </UserPopoutItem>
          </Box>
        </Popover>
      </AvatarWrapper>
    </>
  );
};
