import { log } from 'common/log';
import { DataError } from 'components/Errors';
import * as React from 'react';
import { QueryObserverResult, QueryStatus } from 'react-query';
import { ErrorBoundary } from './ErrorBoundary';

const defaultErrorTitle = 'Failed to fetch data';

interface WaitForQueryProps<T> {
    children: (data: T) => React.ReactNode;
    /** Component to use for displaying errors. This will override `errorTitle` */
    errorComponent?: React.ComponentType<{ error?: Error; retry?(): any }>;
    /** The string to display as the header of the error content */
    errorTitle?: string;
    /** Loading state (passed from a hook using useQuery) */
    query: QueryObserverResult<T, Error>;
    /** A callback that will initiaite a fetch of the underlying resource. This
     * is wired to a "Retry" button when showing the error visual.
     */
    fetch?(): any;
}

/** A wrapper component which will wait to display children until the passed `status` string is
 * `QueryStatus.Success`. Will render a defult or provided error component if the
 * corresponding query results in an error
 */
export const WaitForQuery = <T extends object>({
    children,
    errorComponent: ErrorComponent,
    errorTitle = defaultErrorTitle,
    query,
    fetch
}: WaitForQueryProps<T>) => {
    switch (query.status) {
        case 'idle': {
            return null;
        }
        case 'loading': {
            // TODO:
            return null;
        }
        case 'success': {
            if (query.data === undefined) {
                log.error(
                    'Unexpected `undefined` query data when rendering successful query: ',
                    query
                );
                return null;
            }
            return (
                <ErrorBoundary>
                    <>{children(query.data)}</>
                </ErrorBoundary>
            );
        }
        case 'error': {
            const error = query.error || new Error('Unknown failure');
            return ErrorComponent ? (
                <ErrorComponent error={error} retry={fetch} />
            ) : null;
        }
        default:
            log.error(`Unexpected query status value: ${status}`);
            return null;
    }
};
