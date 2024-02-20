import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query/react';
import { adminApi } from './apis/admin';
import { logsApi } from './apis/logs';

export const store = configureStore({
  reducer: {
    [adminApi.reducerPath]: adminApi.reducer,
    [logsApi.reducerPath]: logsApi.reducer,
  },
  // https://redux-toolkit.js.org/rtk-query/overview
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(adminApi.middleware, logsApi.middleware);
  },
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const { dispatch } = store;
