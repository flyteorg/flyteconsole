import { InfiniteQueryObserverOptions, QueryObserverOptions } from 'react-query';
import { QueryType } from './queries';

type QueryKeyArray = [QueryType, ...unknown[]];
export interface QueryInput<T> extends QueryObserverOptions<T, Error> {
    queryKey: QueryKeyArray;
    queryFn: QueryObserverOptions<T, Error>['queryFn'];
}

export interface InfiniteQueryInput<T> extends InfiniteQueryObserverOptions<InfiniteQueryPage<T>, Error> {
    queryKey: QueryKeyArray;
    queryFn: InfiniteQueryObserverOptions<InfiniteQueryPage<T>, Error>['queryFn'];
}

export interface InfiniteQueryPage<T> {
    data: T[];
    token?: string;
}
