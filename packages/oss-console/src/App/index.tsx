import '../common/setupProtobuf';
import React, { PropsWithChildren } from 'react';
import Collapse from '@mui/material/Collapse';
import { FlyteApiProvider } from '@clients/flyte-api/ApiProvider';
import { SnackbarProvider } from 'notistack';
import { env } from '@clients/common/environment';
import { SkeletonTheme } from 'react-loading-skeleton';
import {
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Router } from 'react-router-dom';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { FeatureFlagsProvider } from '../basics/FeatureFlags';
import { debug, debugPrefix } from '../common/log';
import { APIContext, useAPIState } from '../components/data/apiContext';
import { QueryAuthorizationObserver } from '../components/data/QueryAuthorizationObserver';
import { createQueryClient } from '../components/data/queryCache';
import { SystemStatusBanner } from '../components/Notifications/SystemStatusBanner';
import { history } from '../routes/history';
import { LocalCacheProvider } from '../basics/LocalCache/ContextProvider';
import GlobalStyles from '../components/utils/GlobalStyles';
import { ColumnStyles, ExecutionTableStyles } from '../components/Executions/Tables/styles';
import { WorkflowExecutionsColumnsStyles } from '../components/Executions/Tables/WorkflowExecutionTable/styles';
import { LiteralStyles } from '../components/Literals/styles';
import { LaunchFormStyles } from '../components/Launch/LaunchForm/styles';
import TopLevelLayout from '../components/common/TopLevelLayout/TopLevelLayout';
import TopLevelLayoutProvider from '../components/common/TopLevelLayout/TopLevelLayoutState';
import ApplicationRouter from './ApplicationRouter';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import DownForMaintenance from '../components/Errors/DownForMaintenance';

const QueryClientProvider: React.FC<PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

const queryClient = createQueryClient();

export const AppComponent: React.FC<unknown> = () => {
  if (env.NODE_ENV === 'development') {
    debug.enable(`${debugPrefix}*:*`);
  }
  const apiState = useAPIState();

  const isSiteDown = !!env.MAINTENANCE_MODE?.length;
  if (isSiteDown) return <DownForMaintenance />;

  return (
    <>
      <ExecutionTableStyles />
      <ColumnStyles />
      <LiteralStyles />
      <LaunchFormStyles />
      <WorkflowExecutionsColumnsStyles />
      <FeatureFlagsProvider>
        <GlobalStyles />
        <LocalCacheProvider>
          <SnackbarProvider
            // Notifications provider https://iamhosseindhv.com/notistack/demos
            maxSnack={2}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            TransitionComponent={Collapse}
          >
            <QueryClientProvider client={queryClient}>
              <FlyteApiProvider flyteApiDomain={env.ADMIN_API} disableAutomaticLogin>
                <APIContext.Provider value={apiState}>
                  <QueryAuthorizationObserver />
                  <SkeletonTheme
                    baseColor={CommonStylesConstants.skeletonColor}
                    highlightColor={CommonStylesConstants.skeletonHighlightColor}
                  >
                    <Router history={history}>
                      <ErrorBoundary fixed>
                        <TopLevelLayoutProvider>
                          <TopLevelLayout>
                            <ApplicationRouter />
                          </TopLevelLayout>
                        </TopLevelLayoutProvider>
                      </ErrorBoundary>
                    </Router>
                    <SystemStatusBanner />
                  </SkeletonTheme>
                </APIContext.Provider>
              </FlyteApiProvider>
              <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            </QueryClientProvider>
          </SnackbarProvider>
        </LocalCacheProvider>
      </FeatureFlagsProvider>
    </>
  );
};

export default AppComponent;
