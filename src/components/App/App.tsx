import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { env } from 'common/env';
import { debug, debugPrefix } from 'common/log';
import { APIContext, useAPIState } from 'components/data/apiContext';
import { LoginExpiredHandler } from 'components/Errors/LoginExpiredHandler';
import { SystemStatusBanner } from 'components/Notifications/SystemStatusBanner';
import { skeletonColor, skeletonHighlightColor } from 'components/Theme';
import { muiTheme } from 'components/Theme/muiTheme';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { hot } from 'react-hot-loader';
import { SkeletonTheme } from 'react-loading-skeleton';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Router } from 'react-router-dom';
import { ApplicationRouter } from 'routes/ApplicationRouter';
import { history } from 'routes/history';
import { NavBarRouter } from 'routes/NavBarRouter';
import { ErrorBoundary } from '../common';

const queryCache = new QueryCache();

export const AppComponent: React.StatelessComponent<{}> = () => {
    if (env.NODE_ENV === 'development') {
        debug.enable(`${debugPrefix}*:*`);
    }
    const apiState = useAPIState();

    return (
        <ThemeProvider theme={muiTheme}>
            <ReactQueryCacheProvider queryCache={queryCache}>
                <APIContext.Provider value={apiState}>
                    <SkeletonTheme
                        color={skeletonColor}
                        highlightColor={skeletonHighlightColor}
                    >
                        <CssBaseline />
                        <Helmet>
                            <title>Flyte Console</title>
                            <meta
                                name="viewport"
                                content="width=device-width"
                            />
                        </Helmet>
                        <Router history={history}>
                            <ErrorBoundary fixed={true}>
                                <NavBarRouter />
                                <ApplicationRouter />
                                <LoginExpiredHandler />
                            </ErrorBoundary>
                        </Router>
                        <SystemStatusBanner />
                    </SkeletonTheme>
                </APIContext.Provider>
                <ReactQueryDevtools initialIsOpen={false} />
            </ReactQueryCacheProvider>
        </ThemeProvider>
    );
};

export const App = hot(module)(AppComponent);
