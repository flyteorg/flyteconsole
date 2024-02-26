import React, { PropsWithChildren, useEffect, useState } from 'react';

import { Flyte } from '../../types/flyteTypes';
import { IdentityContext, ProfileResult, RequestResult } from './IdentityContext';
import { apiEndpoints } from '../../utils/endpoints';
import { QueryError, QueryResult, useAdminQuery } from '../DataProvider/apis/admin';

function pickResult<T>(result: QueryResult<T>) {
  return {
    data: result.data as T,
    isLoading: result.isLoading,
    error: result.error as QueryError,
    refetch: result.refetch,
  } as RequestResult<T>;
}

export const IdentityProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [profile, setProfile] = useState<ProfileResult>({});

  // make request for user profile
  const profileQuery = useAdminQuery<QueryResult<Flyte.Profile>>({ path: apiEndpoints.profile });

  // update profile data
  useEffect(() => {
    if (profileQuery.isUninitialized) {
      return;
    }

    const result = pickResult<Flyte.Profile>(profileQuery);

    setProfile(result);
  }, [profileQuery]);

  // This component will render its children wrapped around a IdentityContext's provider whose
  // value is set to the method defined above
  return (
    <IdentityContext.Provider
      value={{
        profile,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};
