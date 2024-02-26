/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import throttle from 'lodash/throttle';
import { env } from '@clients/common/environment';
import {
  LogQueryArgs,
  LogResult,
  LogsResponse,
  getLogsEndpoint,
  getTaskId,
  isLogResult,
  parseErrorResponse,
  parseLogsResponse,
  parseSingleLog,
} from './logs-utils';
import { getAdminDomain } from '../../../utils/api';

export const logsApi = createApi({
  reducerPath: 'logsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `//${getAdminDomain()}`,
    ...(env.NODE_ENV === 'development' ? { mode: 'cors' } : {}),
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'text/plain');
    },
  }),
  endpoints: (build) => ({
    getLogs: build.query<LogsResponse, LogQueryArgs>({
      query: (queryArgs) => {
        const endpoint = getLogsEndpoint(queryArgs);
        return {
          url: endpoint,
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          },
          credentials: 'include',
          /**
           * The data we receive is not standard JSON, so we need to parse it manually before RTK can throw an error
           */
          responseHandler: (response) => response.text(),
        };
      },

      transformErrorResponse(baseQueryReturnValue: any) {
        return parseErrorResponse(baseQueryReturnValue?.data);
      },
      transformResponse: async (response: string, _meta, queryArgs: LogQueryArgs) => {
        const id = getTaskId(queryArgs);
        const result = parseLogsResponse(response);
        return { [id]: result };
      },
      merge: (currentCache, newItems, { arg: queryArgs }) => {
        const id = getTaskId(queryArgs);
        currentCache[id].splice(0);
        currentCache[id].push(...newItems[id]);
      },
      async onCacheEntryAdded(queryArgs, { updateCachedData, cacheEntryRemoved, cacheDataLoaded }) {
        if (!queryArgs) return;
        let ws: WebSocket;
        let removeCacheBeforeUpdate = true;
        const endpoint = `wss://${getAdminDomain()}${getLogsEndpoint(queryArgs, true)}`;
        const taskId = getTaskId(queryArgs);
        try {
          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded;

          // establish connection to WS
          ws = new WebSocket(endpoint);

          const messageQueue: LogResult[] = [];
          // using throttle vs debounce to provide more frequent updates to the UI
          // throttle = ensures a function is only called once per specified time period
          const updateCachedDataThrottled = throttle(() => {
            if (!messageQueue.length) return;

            updateCachedData((draft) => {
              const newCacheItems = messageQueue.splice(0);
              if (removeCacheBeforeUpdate) {
                // empty the message queue and push the messages to the cache
                removeCacheBeforeUpdate = false;
                const length = draft[taskId]?.length;
                draft[taskId]?.splice?.(0, length, ...newCacheItems);
              } else {
                draft[taskId].push(...newCacheItems);
              }
            });
          }, 100);

          // when data is received from the socket connection to the server,
          // if it is a message and for the appropriate channel,
          // update our query result with the received message
          ws.addEventListener('message', (event: MessageEvent) => {
            const data = Buffer.from(event.data, 'base64').toString('utf-8');

            const message = parseSingleLog(data);

            if (!message || !isLogResult(message)) return;

            messageQueue.push(message);
            updateCachedDataThrottled();
          });
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }

        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;

        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        // this will be called by default after the 60-second 'keepUnusedDataFor' timeout
        // @ts-ignore
        ws?.close?.();
      },
    }),
  }),
});

export const { useGetLogsQuery } = logsApi;
