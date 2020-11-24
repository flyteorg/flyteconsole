import { QueryObserverOptions } from 'react-query';
import { QueryKey } from './queries';

type QueryKeyArray = [QueryKey, ...unknown[]];
export interface QueryInput<T> extends QueryObserverOptions<T, Error> {
    queryKey: QueryKeyArray;
    queryFn: QueryObserverOptions<T, Error>['queryFn'];
}
