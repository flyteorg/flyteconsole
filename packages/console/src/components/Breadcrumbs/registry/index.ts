import { Breadcrumb } from '../types';
import { flyteBreadcrumbRegistryList, makeBreadcrumb } from './default';

// breadcrumb registry class to hold and add breadcrumbs
class BreadcrumbRegistry {
  breadcrumbs: Breadcrumb[] = [];

  constructor() {
    this.breadcrumbs = flyteBreadcrumbRegistryList;
  }

  public addBreadcrumb(breadcrumb: Partial<Breadcrumb>) {
    const breadcrumbData = makeBreadcrumb(breadcrumb);

    const existingBreadcrumb = this.breadcrumbs.find(
      b => b.pathId === breadcrumb.pathId,
    );

    if (existingBreadcrumb) {
      Object.assign(breadcrumbData, existingBreadcrumb);
    } else {
      this.breadcrumbs.push(breadcrumbData);
    }

    return breadcrumbData;
  }
}

const breadcrumbRegistry = new BreadcrumbRegistry();
export default breadcrumbRegistry;
