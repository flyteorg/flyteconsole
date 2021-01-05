import { NotAuthorizedError } from 'errors/fetchErrors';
import * as React from 'react';
import { onlineManager, Query, useQueryClient } from 'react-query';
import { useAPIContext } from './apiContext';

/** Watches all queries to detect a NotAuthorized error, disabling future queries
 * and triggering the login refresh flow.
 * Note: Should be placed just below the QueryClient and ApiContext providers.
 */
export const QueryAuthorizationObserver: React.FC = () => {
    const queryCache = useQueryClient().getQueryCache();
    const apiContext = useAPIContext();
    React.useEffect(() => {
        const unsubscribe = queryCache.subscribe(
            (query?: Query | undefined) => {
                if (!query || !query.state.error) {
                    return;
                }
                if (query.state.error instanceof NotAuthorizedError) {
                    // Stop all in-progress and future requests
                    onlineManager.setOnline(false);
                    // TODO: https://github.com/lyft/flyte/issues/525
                    // Notify user of unauthorized status
                    apiContext.loginStatus.setExpired(true);
                }
            }
        );
        return unsubscribe;
    }, [queryCache, apiContext]);
    return null;
};
