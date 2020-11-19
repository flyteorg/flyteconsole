import { isObject, isPlainObject } from 'lodash';
import {
    hashQueryKey,
    QueryCache,
    QueryClient,
    QueryKeyHashFunction
} from 'react-query';

export const queryCache = new QueryCache();

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

export const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
        queries: { queryKeyHashFn: normalizeObjectPrototypeKeys }
    }
});
