import { subnavBarContentId } from 'common/constants';
import { log } from 'common/log';
import * as React from 'react';
import ReactDOM from 'react-dom';

/** Complements NavBar, allowing pages to inject custom content. */
export const SubNavBarContent: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const navBar = document.getElementById(subnavBarContentId);
  if (navBar == null) {
    log.warn(`
            Attempting to mount content into NavBar, but failed to find the content component.
            Did you mount an instance of NavBar with useCustomContent=true?`);
    return null;
  }
  return ReactDOM.createPortal(children, navBar);
};
