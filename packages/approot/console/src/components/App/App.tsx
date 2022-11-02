import * as React from 'react';
import { CssBaseline, Collapse } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { FlyteApiProvider } from '@flyteconsole/flyte-api';
import { SnackbarProvider } from 'notistack';
import {
  debug,
  debugPrefix,
  env,
  FeatureFlagsProvider,
  LocalCacheProvider,
  ErrorBoundary,
} from '@flyteconsole/components';
import { APIContext, useAPIState } from 'components/data/apiContext';
import { QueryAuthorizationObserver } from 'components/data/QueryAuthorizationObserver';
import { createQueryClient } from 'components/data/queryCache';
import { SystemStatusBanner } from 'components/Notifications/SystemStatusBanner';
import { skeletonColor, skeletonHighlightColor, muiTheme } from '@flyteconsole/ui-atoms';
import { hot } from 'react-hot-loader';
import { SkeletonTheme } from 'react-loading-skeleton';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { AppFrame } from '../../routes';

const queryClient = createQueryClient();

export const AppComponent: React.FC = () => {
  if (env.NODE_ENV === 'development') {
    debug.enable(`${debugPrefix}*:*`);
  }
  const apiState = useAPIState();

  return (
    <FeatureFlagsProvider>
      <LocalCacheProvider>
        <ThemeProvider theme={muiTheme}>
          <SnackbarProvider
            // Notifications provider https://iamhosseindhv.com/notistack/demos
            maxSnack={2}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            TransitionComponent={Collapse}
          >
            <QueryClientProvider client={queryClient}>
              <FlyteApiProvider flyteApiDomain={env.ADMIN_API_URL}>
                <APIContext.Provider value={apiState}>
                  <QueryAuthorizationObserver />
                  <SkeletonTheme color={skeletonColor} highlightColor={skeletonHighlightColor}>
                    <CssBaseline />
                    <BrowserRouter>
                      <ErrorBoundary fixed={true}>
                        <AppFrame />
                      </ErrorBoundary>
                    </BrowserRouter>
                    <SystemStatusBanner />
                  </SkeletonTheme>
                </APIContext.Provider>
              </FlyteApiProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </LocalCacheProvider>
    </FeatureFlagsProvider>
  );
};

export const App = hot(module)(AppComponent);
