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
                    console.log('components/data/QueryAuthorizationObserver:1');
                    return;
                }
                if (query.state.error instanceof NotAuthorizedError) {
                    console.log('components/data/QueryAuthorizationObserver:2');
                    // Stop all in-progress and future requests
                    onlineManager.setOnline(false);
                    // Trigger auth flow
                    apiContext.loginStatus.setExpired(true);
                }
            }
        );
        return unsubscribe;
    }, [queryCache, apiContext]);
    return null;
};
