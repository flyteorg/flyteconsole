import { createDebugLogger } from 'common/log';
import { getCacheKey } from 'components/Cache';
import { useEffect } from 'react';
import { FetchableData, fetchStates, RefreshConfig } from './types';

const log = createDebugLogger('useDataRefresher');

const defaultRefresh = (fetchable: FetchableData<any>) => fetchable.fetch();

/** A hook which attaches auto-refresh behavior to a `FetchableData` object.
 * @param id A unique id value used to key this hook. This usually should match
 * the value provided to your data-fetching hook
 * @param fetchable An instance of `FetchableData`, usually provided by a data-
 * fetching hook
 * @param refreshConfig Configures the refresh behavior (interval, termination
 * logic, fetch function, etc)
 */
export function useDataRefresher<T, IDType extends object | string>(
    id: IDType,
    fetchable: FetchableData<T>,
    refreshConfig: RefreshConfig<T>
) {
    const { interval } = refreshConfig;
    const { debugName, state, value } = fetchable;

    const isFinal = refreshConfig.valueIsFinal(value);

    // Default refresh implementation is just to fetch the current entity
    const doRefresh = refreshConfig.doRefresh || defaultRefresh;

    useEffect(() => {
        if (isFinal) {
            return;
        }

        let timerId: number = 0;

        const clear = () => {
            if (timerId === 0) {
                return;
            }

            log(`${debugName} detaching data refresher`);
            window.clearInterval(timerId);
        };

        if (state.matches(fetchStates.LOADED)) {
            log(`${debugName} attaching data refresher`);
            timerId = window.setInterval(() => doRefresh(fetchable), interval);
        } else {
            log(
                `${debugName} not refreshing fetchable because it is not in LOADED state`,
                fetchable
            );
        }

        // When this effect is cleaned up, we should stop refreshing
        return clear;
    }, [getCacheKey(id), state.value, isFinal]);
}
