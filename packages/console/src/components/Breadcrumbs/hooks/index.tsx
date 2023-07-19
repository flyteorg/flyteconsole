import React, { useLayoutEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { injectGlobal } from 'emotion';
import { Breadcrumb } from '../types';
import { breadcrumbRegistry } from '../registry';

/**
 * A way to inject a breadcrumb from anywhere in the system.
 * Useful for capturing formatted data from other data providers.
 *
 * @param breadcrumb
 */
export const useSetBreadcrumbSeed = (breadcrumb: Breadcrumb | null) => {
  if (!breadcrumb) return;

  const isEqualObj = isEqual(
    breadcrumb,
    breadcrumbRegistry.breadcrumbSeeds.find(b => breadcrumb.id === b.id),
  );
  if (isEqualObj) return;

  const event = new CustomEvent('__FLYTE__BREADCRUMB__', {
    detail: {
      breadcrumb,
    },
  });
  window.dispatchEvent(event);
  return;
};

/**
 * Turns the breadcrumb into the title bar variant.
 * Can inject other css too.
 *
 * @param customStyles
 */
export const useBreadCrumbsGreyStyle = () => {
  const breadcrumbBackground = `.breadcrumbs {
    transition: background-color 0.2s ease-in-out;
    background-color: #F2F3F3;
    border-bottom: 1px solid lightgrey;
    __BREADCRUMB_GREY_TEMP__: remove-me;
  }`;

  useLayoutEffect(() => {
    injectGlobal(breadcrumbBackground);
    return () => {
      // remove global css sheet with matching comment text
      [...document.querySelectorAll('style')]
        .filter(s => s.innerHTML.includes('__BREADCRUMB_GREY_TEMP__'))
        .forEach(s => {
          s.remove();
        });
    };
  }, []);

  return <></>;
};
