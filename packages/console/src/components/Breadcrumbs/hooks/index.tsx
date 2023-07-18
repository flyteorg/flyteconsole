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
