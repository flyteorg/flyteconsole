import 'intersection-observer';
import * as React from 'react';
import {
  CssBaseline,
  Collapse,
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { FlyteApiProvider } from '@flyteorg/flyte-api';
import { SnackbarProvider } from 'notistack';
import { FeatureFlagsProvider } from 'basics/FeatureFlags';
import { env, updateEnv } from '@flyteorg/common';
import { debug, debugPrefix } from 'common/log';
import { ErrorBoundary } from 'components/common/ErrorBoundary';
import { APIContext, useAPIState } from 'components/data/apiContext';
import { QueryAuthorizationObserver } from 'components/data/QueryAuthorizationObserver';
import { createQueryClient } from 'components/data/queryCache';
import { SystemStatusBanner } from 'components/Notifications/SystemStatusBanner';
import {
  skeletonColor,
  skeletonHighlightColor,
  updateConstants,
} from 'components/Theme/constants';
import { getMuiTheme } from 'components/Theme/muiTheme';
import { SkeletonTheme } from 'react-loading-skeleton';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Router } from 'react-router-dom';
import { ApplicationRouter } from 'routes/ApplicationRouter';
import { history } from 'routes/history';
import { LocalCacheProvider } from 'basics/LocalCache/ContextProvider';
import {
  ExternalConfigurationProvider,
  ExternalConfigurationProviderProps,
} from 'basics/ExternalConfigurationProvider';
import TopLevelLayoutProvider from 'components/Navigation/TopLevelLayoutState';
import TopLevelLayout from 'components/Navigation/TopLevelLayout';
import NavBar from 'components/Navigation/NavBar';
import { SideNavigation } from 'components/Navigation/SideNavigation';
import GlobalStyles from 'components/utils/GlobalStyles';

export type AppComponentProps = ExternalConfigurationProviderProps;

const queryClient = createQueryClient();
let overrided = false;

export const AppComponent: React.FC<AppComponentProps> = (
  props: AppComponentProps,
) => {
  if (!overrided) {
    updateEnv(props.env);
    updateConstants(props.config);
    overrided = true;
  }

  if (env.NODE_ENV === 'development') {
    debug.enable(`${debugPrefix}*:*`);
  }
  const apiState = useAPIState();

  const horizontalLayoutFlag =
    `${env.HORIZONTAL_LAYOUT}`.trim().toLowerCase() === 'true';

  return (
    <FeatureFlagsProvider>
      <GlobalStyles />
      <LocalCacheProvider>
        <StylesProvider
          generateClassName={createGenerateClassName({
            seed: 'c-',
          })}
        >
          <ThemeProvider theme={getMuiTheme(props.config)}>
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
                    <SkeletonTheme
                      color={skeletonColor}
                      highlightColor={skeletonHighlightColor}
                    >
                      <CssBaseline />
                      <ExternalConfigurationProvider {...props}>
                        <Router history={history}>
                          <ErrorBoundary fixed={true}>
                            <TopLevelLayoutProvider>
                              <TopLevelLayout
                                headerComponent={<NavBar />}
                                sideNavigationComponent={<SideNavigation />}
                                routerView={<ApplicationRouter />}
                                isHorizontalLayout={horizontalLayoutFlag}
                              />
                            </TopLevelLayoutProvider>
                          </ErrorBoundary>
                        </Router>
                      </ExternalConfigurationProvider>
                      <SystemStatusBanner />
                    </SkeletonTheme>
                  </APIContext.Provider>
                </FlyteApiProvider>
                <ReactQueryDevtools
                  initialIsOpen={false}
                  position="bottom-right"
                />
              </QueryClientProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </StylesProvider>
      </LocalCacheProvider>
    </FeatureFlagsProvider>
  );
};

export const App = AppComponent;
