import { NotAuthorizedError } from 'errors/fetchErrors';
import { isObject, isPlainObject } from 'lodash';
import {
    hashQueryKey,
    QueryCache,
    QueryClient,
    QueryKeyHashFunction
} from 'react-query';
import { attachQueryDefaults } from './queryDefaults';

export const queryCache = new QueryCache();
const allowedFailures = 3;

function isErrorRetryable(error: any) {
    // Fail immediately for auth errors, retries won't succeed
    return !(error instanceof NotAuthorizedError);
}

const normalizeObjectPrototypeKeys: QueryKeyHashFunction = queryKey => {
    const arrayQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
    // for objects with non-default prototypes (such as decoded protobufJS messages),
    // the built-in serialization won't work correctly. So we will convert them
    // to plain objects by spreading ownProperties into a new object.
    const normalizedKey = arrayQueryKey.map(key => {
        if (isObject(key) && !isPlainObject(key)) {
            return { ...key };
        }
        return key;
    });
    return hashQueryKey(normalizedKey);
};

export const queryClient = attachQueryDefaults(
    new QueryClient({
        queryCache,
        defaultOptions: {
            queries: {
                queryKeyHashFn: normalizeObjectPrototypeKeys,
                retry: (failureCount, error) =>
                    failureCount < allowedFailures && isErrorRetryable(error)
            }
        }
    })
);
