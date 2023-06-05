import * as React from 'react';
import { useFlyteApi } from '@flyteorg/flyte-api';
import {
  Avatar,
  Box,
  IconButton,
  Link,
  makeStyles,
  Popover,
  Theme,
  Typography,
} from '@material-ui/core';
import { WaitForData } from 'components/common/WaitForData';
import { useUserProfile } from 'components/hooks/useUserProfile';
import t from './strings';
import { useTopLevelLayoutContext } from './TopLevelLayoutState';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    color: theme.palette.common.white,
  },
  avatar: {
    width: '2rem',
    height: '2rem',
    fontSize: '1rem',
    backgroundColor: theme.palette.primary.dark,
  },
}));

const LoginLink = (props: { loginUrl: string }) => {
  return (
    <Link href={props.loginUrl} color="inherit">
      {t('login')}
    </Link>
  );
};

/** Displays user info if logged in, or a login link otherwise. */
export const UserInformation: React.FC<{}> = () => {
  const styles = useStyles();
  const profile = useUserProfile();
  const apiContext = useFlyteApi();
  const { isLayoutHorizontal } = useTopLevelLayoutContext();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const userName = React.useMemo(() => {
    if (!profile.value) {
      return null;
    }
    return !profile.value.preferredUsername ||
      profile.value.preferredUsername === ''
      ? profile.value.name
      : profile.value.preferredUsername;
  }, [profile.value]);

  const userNameInitial = React.useMemo(() => {
    if (!userName) {
      return '';
    }
    return userName[0].toLocaleUpperCase();
  }, [userName]);

  const open = Boolean(anchorEl);

  return (
    <WaitForData spinnerVariant="none" {...profile}>
      <div className={styles.container}>
        {!profile.value && <LoginLink loginUrl={apiContext.getLoginUrl()} />}
        {profile.value && (
          <>
            {isLayoutHorizontal ? (
              <IconButton
                aria-owns="avatar-popover"
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                disableFocusRipple
              >
                <Avatar className={styles.avatar}>{userNameInitial}</Avatar>
                <Popover
                  open={open}
                  id="avatar-popover"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  onClose={handlePopoverClose}
                  disableRestoreFocus
                >
                  <Box pl={1} pr={1} pt={1} pb={1}>
                    <Typography>{userName}</Typography>
                  </Box>
                </Popover>
              </IconButton>
            ) : (
              <span>{userName}</span>
            )}
          </>
        )}
      </div>
    </WaitForData>
  );
};

export const UserInformationV2: React.FC<{}> = () => {
  const style = useStyles();
  const profile = useUserProfile();
  const apiContext = useFlyteApi();

  return (
    <WaitForData spinnerVariant="none" {...profile}>
      <div className={style.container}>
        {!profile.value ? (
          <LoginLink loginUrl={apiContext.getLoginUrl()} />
        ) : (
          profile.value.name
        )}
      </div>
    </WaitForData>
  );
};
