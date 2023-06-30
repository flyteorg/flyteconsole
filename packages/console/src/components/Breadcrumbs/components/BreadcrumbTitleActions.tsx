import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { createPortal } from 'react-dom';

/**
 * This component is used to render a portal for the breadcrumb title actions.
 * This is used to render the actions inline with the breadcrumb title.
 * This is used in the Breadcrumbs component.
 *
 * Don't export portal to the public API, there can only be 1 on a page.
 */
const BreadcrumbTitleActionsPortal = () => {
  return (
    <Grid container justifyContent="flex-end" alignContent="center">
      <Grid item>
        <div id="bread-crumb-actions"></div>
      </Grid>
    </Grid>
  );
};

/**
 * Render the actions inline with the breadcrumb title.
 * Use it from other components templatess through the app similar to the Modal componet.
 *
 * There must be an instance of <Breadcrumb /> on the page for this to render.
 *
 * @param children
 */
const BreadcrumbTitleActions = ({ children = <></> }) => {
  const [portalRef, setPortalRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!portalRef) {
      const domElement = document.getElementById('bread-crumb-actions');
      setPortalRef(domElement);
    }
  }, [portalRef]);

  if (!portalRef) return <></>;
  return <>{createPortal(<>{children}</>, portalRef)}</>;
};

export { BreadcrumbTitleActionsPortal };
export default BreadcrumbTitleActions;
