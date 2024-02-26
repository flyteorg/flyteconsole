import { EventObject, State, StateMachine } from 'xstate';
import { PaginatedEntityResponse, RequestConfig } from '@clients/common/types/adminEntityTypes';

export enum fetchStates {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  FAILED = 'FAILED',
  FAILED_RETRYING = 'FAILED_RETRYING',
  REFRESHING = 'REFRESHING',
  REFRESH_FAILED = 'REFRESH_FAILED',
  REFRESH_FAILED_RETRYING = 'REFRESH_FAILED_RETRYING',
}

export enum fetchEvents {
  CANCEL = 'CANCEL',
  FAILURE = 'FAILURE',
  LOAD = 'LOAD',
  RESET = 'RESET',
  SUCCESS = 'SUCCESS',
}

export interface FetchEventObject extends EventObject {
  type: fetchEvents;
}

export interface FetchStateSchema {
  states: { [k in fetchStates]: any };
}

export interface FetchStateContext<T> {
  debugName?: string;
  defaultValue: T;
  lastError: Error | null;
  value: T;
}

export type FetchableState<T> = State<FetchStateContext<T>, FetchEventObject, FetchStateSchema>;

export type FetchMachine<T> = StateMachine<
  FetchStateContext<T>,
  FetchStateSchema,
  FetchEventObject
>;

export interface FetchableData<T> {
  debugName: string;
  fetch(): void;
  lastError: Error | null;
  state: FetchableState<any>;
  value: T;
}

export interface PaginationValue<T> {
  token?: string;
  items: T[];
}
export interface PaginatedFetchableData<T> extends FetchableData<T[]> {
  /** Whether or not a fetch would yield more items. Useful for determining if
   * a "load more" button should be shown
   */
  moreItemsAvailable: boolean;
}

export type FetchFn<T, DataType> = (data: DataType, currentValue?: T) => Promise<T>;

export type PaginatedFetchFn<T, DataType = undefined> = (
  data: DataType,
  config: RequestConfig,
) => Promise<PaginatedEntityResponse<T>>;
