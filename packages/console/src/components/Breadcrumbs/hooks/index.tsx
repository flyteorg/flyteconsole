import { Breadcrumb } from '../types';

/**
 * A way to inject a breadcrumb from anywhere in the system.
 * Useful for capturing formatted data from other data providers.
 *
 * @param breadcrumb
 */
export const useSetBreadcrumbSeed = (breadcrumb: Breadcrumb | null) => {
  if (!breadcrumb) return;
  const event = new CustomEvent('__FLYTE__BREADCRUMB__', {
    detail: {
      breadcrumb,
    },
  });
  window.dispatchEvent(event);
  return;
};
