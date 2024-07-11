import * as React from 'react';
import { onlineManager, Query, useQueryClient } from 'react-query';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';

/** Watches all queries to detect a NotAuthorized error, disabling future queries
 * and triggering the login refresh flow.
 * Note: Should be placed just below the QueryClient and ApiContext providers.
 */

export const QueryAuthorizationObserver: React.FC = () => {
  const queryCache = useQueryClient().getQueryCache();
  const apiContext = useFlyteApi();
  React.useEffect(() => {
    const unsubscribe = queryCache.subscribe(async (_query?: Query | undefined) => {
      if (!onlineManager.isOnline()) {
        // trigger sign in modal
        apiContext.loginStatus.setExpired(true);
      }
    });
    return unsubscribe;
  }, [queryCache, apiContext]);
  return null;
};
