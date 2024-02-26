import React from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import { UserProfile } from './UserProfile';
import t from './strings';
import { Flyte } from '../types/flyteTypes';

interface ActionsProps {
  loading: boolean;
  profile?: Flyte.Profile;
}

/** Displays LoginButton or Actions bar */
export const Actions = ({ loading, profile }: ActionsProps) => {
  if (loading) {
    return null;
  }

  const { getLoginUrl } = useFlyteApi();
  const loginUrl = getLoginUrl();

  // Provide a button to login
  if (!profile) {
    return (
      <Grid item data-pinned-nav-link="login" data-cy="pinned-nav-link-login">
        <Button
          data-cy="login-button"
          color="inherit"
          variant="text"
          href={loginUrl}
          size="small"
          style={{
            color: 'white',
            width: '100%',
          }}
        >
          {t('loginButton')}
        </Button>
      </Grid>
    );
  }

  return <UserProfile profile={profile} />;
};
