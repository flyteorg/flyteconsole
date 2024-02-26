/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryDefinition,
} from '@reduxjs/toolkit/query/react';
import type { UseQueryHookResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { IntervalFilterType } from '../../../types/cloudTypes';
import { generateTimestampsForRange } from '../utils';
import { removeISOMilliseconds } from '../../../utils/dateUtils';
import { formatEndpointV2, getAdminDomain } from '../../../utils/api';
import { env } from '../../../utils/environment';

export interface QueryRequestArgs {
  path: string;
  headers?: any;
  args?: any;
  config?: {
    generateTimestampsForRange: IntervalFilterType;
  };
  body?: any;
}

export interface PostRequestArgs {
  path: string;
  body?: any;
  headers?: any;
}

export interface PutRequestArgs {
  path: string;
  body?: any;
  headers?: any;
}

export interface DeleteRequestArgs {
  path: string;
  body?: any;
  headers?: any;
}
export const POLLING_INTERVAL = 10 * 1000;

export const adminApi = createApi({
  reducerPath: 'adminApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `//${getAdminDomain()}`,
    prepareHeaders(headers) {
      return headers;
    },
    ...(env.NODE_ENV === 'development' ? { mode: 'cors' } : {}),
    credentials: 'include',
  }),

  endpoints: (builder) => {
    return {
      admin: builder.query({
        query: ({ path, args, config, headers, body }: QueryRequestArgs) => {
          const { startTimeUTC, endTimeUTC } = generateTimestampsForRange(
            config?.generateTimestampsForRange,
          );
          const startTime = startTimeUTC ? removeISOMilliseconds(startTimeUTC.toISOString()) : null;
          const endTime = endTimeUTC ? removeISOMilliseconds(endTimeUTC.toISOString()) : null;

          const requestOptions = { ...args, startTime, endTime };
          const endpoint = formatEndpointV2(path, requestOptions);
          return { url: endpoint, headers, method: 'GET', body: JSON.stringify(body) };
        },
      }),
      put: builder.mutation({
        query: ({ path, body, headers }: PutRequestArgs) => {
          return {
            url: path,
            body: JSON.stringify(body),
            method: 'PUT',
            headers,
          };
        },
      }),
      post: builder.mutation({
        query: ({ path, body, headers }: PostRequestArgs) => {
          return {
            url: path,
            body: JSON.stringify(body),
            method: 'POST',
            headers,
          };
        },
      }),
      delete: builder.mutation({
        query: ({ path, body, headers }: DeleteRequestArgs) => {
          return {
            url: path,
            body: JSON.stringify(body),
            method: 'DELETE',
            headers,
          };
        },
      }),
    };
  },
});

export const isError = (response: any): response is FetchBaseQueryError => {
  return 'error' in response;
};

export type QueryError = FetchBaseQueryError;
export type QueryResult<DType> = UseQueryHookResult<
  QueryDefinition<
    string,
    BaseQueryFn<string | FetchArgs, DType, FetchBaseQueryError, {}, FetchBaseQueryMeta>,
    never,
    DType,
    'api'
  >
>;

export const { useAdminQuery, useLazyAdminQuery, useDeleteMutation, usePutMutation } = adminApi;
