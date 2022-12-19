import './setupProtobuf';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReactGA from 'react-ga4';
import { env } from '@flyteoss/common';
import { App } from '@flyteoss/console';

const WrappedApp = () => {
  return <App env={process.env} />;
};

const render = (Component: React.FC) => {
  ReactDOM.render(<Component />, document.getElementById('react-app'));
};

const initializeApp = () => {
  const { ENABLE_GA, GA_TRACKING_ID } = env;

  if (ENABLE_GA !== 'false' && GA_TRACKING_ID !== '') {
    ReactGA.initialize(GA_TRACKING_ID as string);
  }

  if (env.NODE_ENV === 'development') {
    // We use style-loader in dev mode, but it causes a FOUC and some initial styling issues
    // so we'll give it time to add the styles before initial render.
    setTimeout(() => render(WrappedApp), 500);
  } else {
    render(WrappedApp);
  }
};

if (document.body) {
  initializeApp();
} else {
  window.addEventListener('DOMContentLoaded', initializeApp, false);
}
