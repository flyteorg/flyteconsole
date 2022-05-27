import * as React from 'react';
import { CssBaseline, Collapse } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { FlyteApiProvider } from '@flyteconsole/flyte-api';
import { SnackbarProvider } from 'notistack';
import { FeatureFlagsProvider } from 'basics/FeatureFlags';
import { env } from 'common/env';
import { debug, debugPrefix } from 'common/log';
import { ErrorBoundary } from 'components/common/ErrorBoundary';
import { APIContext, useAPIState } from 'components/data/apiContext';
import { QueryAuthorizationObserver } from 'components/data/QueryAuthorizationObserver';
import { createQueryClient } from 'components/data/queryCache';
import { SystemStatusBanner } from 'components/Notifications/SystemStatusBanner';
import { skeletonColor, skeletonHighlightColor } from 'components/Theme/constants';
import { muiTheme } from 'components/Theme/muiTheme';
import { hot } from 'react-hot-loader';
import { SkeletonTheme } from 'react-loading-skeleton';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Router } from 'react-router-dom';
import { ApplicationRouter } from 'routes/ApplicationRouter';
import { history } from 'routes/history';
import { NavBarRouter } from 'routes/NavBarRouter';
import { LocalCacheProvider } from 'basics/LocalCache/ContextProvider';

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
                    <Router history={history}>
                      <ErrorBoundary fixed={true}>
                        <NavBarRouter />
                        <ApplicationRouter />
                      </ErrorBoundary>
                    </Router>
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
