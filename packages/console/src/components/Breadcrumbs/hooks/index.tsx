import { useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';
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
 * @param customStyles
 */
export const useBreadCrumbsGreyStyle = () => {
  const breadcrumbBackground = `.breadcrumbs {
    transition: background-color 0.2s ease-in-out;
    background-color: #F2F3F3;
    border-bottom: 1px solid lightgrey;
  }`;

  const [id] = useState<string>(
    'data-breadcrumb-temp-' + Date.now().toString(),
  );

  useEffect(() => {
    // make a new style tag in the head with js
    const style = document.createElement('style');
    style.innerHTML = breadcrumbBackground;
    style.setAttribute('type', 'text/css');
    style.setAttribute(id, 'true');
    document.head.appendChild(style);

    return () => {
      // remove global css sheet with matching comment text
      [...document.querySelectorAll('style')]
        .filter(s => s.outerHTML.includes(id))
        .forEach(s => {
          s.remove();
        });
    };
  }, [window.location.pathname, id]);

  return;
};
