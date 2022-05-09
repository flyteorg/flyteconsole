import * as React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { WaitForData } from 'components/common/WaitForData';
import { useUserProfile } from 'components/hooks/useUserProfile';
import { getLoginUrl } from 'models/AdminEntity/utils';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    color: theme.palette.common.white,
  },
  iconButton: {
    cursor: 'pointer',
    marginLeft: theme.spacing(1),
  },
}));

const LoginLink: React.FC = () => (
  <Link href={getLoginUrl()} color="inherit">
    Login
  </Link>
);

/** Displays user info if logged in, or a login link otherwise. */
export const UserInformation: React.FC<{}> = () => {
  const style = useStyles();
  const profile = useUserProfile();

  return (
    <WaitForData spinnerVariant="none" {...profile}>
      <div className={style.container}>
        {!profile.value ? (
          <LoginLink />
        ) : !profile.value.preferredUsername || profile.value.preferredUsername === '' ? (
          profile.value.name
        ) : (
          profile.value.preferredUsername
        )}
      </div>
    </WaitForData>
  );
};
