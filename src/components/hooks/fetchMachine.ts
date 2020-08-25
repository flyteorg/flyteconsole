import { assign, InvokeConfig, Machine, State } from 'xstate';
import { fetchEvents, fetchStates } from '.';
import { FetchEventObject, FetchMachine, FetchStateContext } from './types';

export function isLoadingState(state: State<any, any>) {
    return (
        state.matches(fetchStates.LOADING) ||
        state.matches(fetchStates.FAILED_RETRYING) ||
        state.matches(fetchStates.REFRESHING) ||
        state.matches(fetchStates.REFRESH_FAILED_RETRYING)
    );
}

// TODO: Consider using parent states like 'hasValue', 'failed'
// to group some of these. Makes things like WaitForData easier to implement.

function makeLoadService<T>(
    successTarget: string,
    failureTarget: string
): InvokeConfig<FetchStateContext<T>, FetchEventObject> {
    return {
        src: 'doFetch',
        onDone: {
            target: successTarget,
            actions: assign({
                value: (_, event) => event.data
            })
        },
        onError: {
            target: failureTarget,
            actions: assign({ lastError: (_, event) => event.data })
        }
    };
}

const defaultContext: Partial<FetchStateContext<unknown>> = {
    lastError: null
};
export const fetchMachine: FetchMachine<unknown> = Machine<
    FetchStateContext<unknown>,
    FetchEventObject
>({
    id: 'fetch',
    initial: fetchStates.IDLE,
    states: {
        [fetchStates.IDLE]: {
            entry: [
                // When resetting, clear the context back to an initial state
                assign(context => ({
                    ...defaultContext,
                    value: context.defaultValue
                }))
            ],
            on: {
                [fetchEvents.RESET]: `#fetch.${fetchStates.IDLE}`,
                [fetchEvents.LOAD]: `#fetch.${fetchStates.LOADING}`
            }
        },
        [fetchStates.LOADING]: {
            invoke: makeLoadService(
                `#fetch.${fetchStates.LOADED}`,
                `#fetch.${fetchStates.FAILED}`
            )
        },
        [fetchStates.LOADED]: {
            on: {
                [fetchEvents.RESET]: `#fetch.${fetchStates.IDLE}`,
                [fetchEvents.LOAD]: `#fetch.${fetchStates.REFRESHING}`
            }
        },
        [fetchStates.FAILED]: {
            on: {
                [fetchEvents.RESET]: `#fetch.${fetchStates.IDLE}`,
                [fetchEvents.LOAD]: `#fetch.${fetchStates.FAILED_RETRYING}`
            }
        },
        [fetchStates.FAILED_RETRYING]: {
            invoke: makeLoadService(
                `#fetch.${fetchStates.LOADED}`,
                `#fetch.${fetchStates.FAILED}`
            )
        },
        [fetchStates.REFRESHING]: {
            invoke: makeLoadService(
                `#fetch.${fetchStates.LOADED}`,
                `#fetch.${fetchStates.REFRESH_FAILED}`
            )
        },
        [fetchStates.REFRESH_FAILED]: {
            on: {
                [fetchEvents.RESET]: `#fetch.${fetchStates.IDLE}`,
                [fetchEvents.LOAD]: `#fetch.${fetchStates.REFRESH_FAILED_RETRYING}`
            }
        },
        [fetchStates.REFRESH_FAILED_RETRYING]: {
            invoke: makeLoadService(
                `#fetch.${fetchStates.LOADED}`,
                `#fetch.${fetchStates.REFRESH_FAILED}`
            )
        }
    }
});
