import { isEmpty, mergeWith } from 'lodash';
import { Breadcrumb } from '../types';
import { flyteBreadcrumbRegistryList, makeBreadcrumb } from './default';
import { defaultVoid } from '../async/fn';

// breadcrumb registry class to hold and add breadcrumbs
class BreadcrumbRegistry {
  breadcrumbs: Breadcrumb[] = [];

  constructor() {
    this.breadcrumbs = flyteBreadcrumbRegistryList;
  }

  public addBreadcrumb(breadcrumb: Partial<Breadcrumb>) {
    console.log(
      this.breadcrumbs.length,
      this.breadcrumbs.map(b => b.id).join(', '),
    );

    const breadcrumbData = makeBreadcrumb(breadcrumb);

    const existingBreadcrumbIndex = this.breadcrumbs.findIndex(
      b => b.id === breadcrumb.id,
    );

    if (existingBreadcrumbIndex > -1) {
      const existingBreadcrumb = this.breadcrumbs[existingBreadcrumbIndex];

      const newBreadcrumb = mergeWith(
        existingBreadcrumb,
        breadcrumbData,
        (exVal, newVal) => {
          if (typeof newVal === 'function') {
            return newVal.name !== defaultVoid.name ? newVal : exVal;
          }
          if (isEmpty(newVal)) {
            return exVal;
          }
          return newVal;
        },
      );

      this.breadcrumbs[existingBreadcrumbIndex] = newBreadcrumb;
      return this.breadcrumbs[existingBreadcrumbIndex];
    }

    this.breadcrumbs.push(breadcrumbData);
    return breadcrumbData;
  }
}

const breadcrumbRegistry = new BreadcrumbRegistry();
export default breadcrumbRegistry;
