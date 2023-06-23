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

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    color: theme.palette.common.white,
  },
  avatar: {
    width: '2rem',
    height: '2rem',
    fontSize: '1rem',
    backgroundColor: theme.palette.secondary.main,
    border: `1px solid ${theme.palette.common.white}`,
  },
}));

const LoginLink = (props: { loginUrl: string }) => {
  return (
    <Box display="flex" alignItems="center" pb={0.75}>
      <Link href={props.loginUrl} color="inherit">
        {t('login')}
      </Link>
    </Box>
  );
};

/** Displays user info if logged in, or a login link otherwise. */
export const UserInformation: React.FC<{}> = () => {
  const styles = useStyles();
  const profile = useUserProfile();
  const apiContext = useFlyteApi();

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

    return profile.value.preferredUsername
      ? profile.value.preferredUsername
      : profile.value.name;
  }, [profile.value]);

  const givenName = React.useMemo(() => {
    if (!profile.value) {
      return null;
    }

    return profile.value.name
      ? profile.value.name
      : `${profile.value.givenName} ${profile.value.familyName}`.trim();
  }, [profile.value]);

  const userNameInitial = React.useMemo(() => {
    if (!givenName) {
      return '';
    }
    const names = givenName.split(' ');
    const firstInitial = names[0].charAt(0);
    const lastInitial =
      names.length > 1 ? names[names.length - 1].charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toLocaleUpperCase();
  }, [givenName]);

  const open = Boolean(anchorEl);

  return (
    <WaitForData spinnerVariant="none" {...profile}>
      {!profile.value && <LoginLink loginUrl={apiContext.getLoginUrl()} />}
      {profile.value && (
        <>
          <IconButton
            aria-owns="avatar-popover"
            aria-haspopup="true"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            disableFocusRipple
          >
            <Avatar className={styles.avatar}>
              {userNameInitial}
              <span className="sr-only">{userName}</span>
            </Avatar>
            <Popover
              open={open}
              id="avatar-popover"
              anchorEl={anchorEl}
              aria-hidden
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
        </>
      )}
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
