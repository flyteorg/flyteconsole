import { NotAuthorizedError } from 'errors/fetchErrors';
import {
    hashQueryKey,
    QueryCache,
    QueryClient,
    QueryKeyHashFunction
} from 'react-query';
import { attachQueryObservers } from './queryObservers';
import { normalizeQueryKey } from './utils';

const allowedFailures = 3;

function isErrorRetryable(error: any) {
    // Fail immediately for auth errors, retries won't succeed
    return !(error instanceof NotAuthorizedError);
}

const queryKeyHashFn: QueryKeyHashFunction = queryKey =>
    hashQueryKey(normalizeQueryKey(queryKey));

export function createQueryClient() {
    const queryCache = new QueryCache();
    return attachQueryObservers(
        new QueryClient({
            queryCache,
            defaultOptions: {
                queries: {
                    queryKeyHashFn,
                    retry: (failureCount, error) =>
                        failureCount < allowedFailures &&
                        isErrorRetryable(error)
                }
            }
        })
    );
}
