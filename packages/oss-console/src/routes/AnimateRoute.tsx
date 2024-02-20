import React from 'react';
import { History } from 'history';

/**
 * Perform an animation when the route changes
 * Currently only resets scroll
 * @param history
 * @returns
 */
const AnimateRoute = ({ history }: { history: History<any> }) => {
  const from = React.useRef(window.location);

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 0);
  };

  React.useEffect(() => {
    const historyAction = history.listen((to, action) => {
      if (action === 'PUSH') {
        // link click
        return scrollToTop();
      }

      if (action === 'POP' && from.current.pathname !== to.pathname) {
        // browser back button
        // only scroll to top if the path is different
        // ignore query params or hash changes
        return scrollToTop();
      }

      // update from location
      // @ts-ignore
      from.current = to.pathname;
    });

    return () => {
      historyAction();
    };
  }, []);

  return <></>;
};

export default AnimateRoute;
