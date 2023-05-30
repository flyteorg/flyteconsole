import * as React from 'react';
import { useFlyteApi } from '@flyteorg/flyte-api';
import { Link, makeStyles, Theme } from '@material-ui/core';
import { WaitForData } from 'components/common/WaitForData';
import { useUserProfile } from 'components/hooks/useUserProfile';
import t from './strings';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    color: theme.palette.common.white,
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

  const userName = React.useMemo(() => {
    if (!profile.value) {
      return null;
    }
    return !profile.value.preferredUsername ||
      profile.value.preferredUsername === ''
      ? profile.value.name
      : profile.value.preferredUsername;
  }, [profile.value]);

  return (
    <WaitForData spinnerVariant="none" {...profile}>
      <div className={styles.container}>
        {!profile.value && <LoginLink loginUrl={apiContext.getLoginUrl()} />}
        {profile.value && <span>{userName}</span>}
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
