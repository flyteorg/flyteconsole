import { isEmpty, mergeWith } from 'lodash';
import { Breadcrumb } from '../types';
import { flyteBreadcrumbRegistryList, makeBreadcrumb } from './default';
import { defaultVoid } from '../async/fn';

/**
 * Registry for breadcrumbs data. This is a singleton class.
 * Use the exported instance `breadcrumbRegistry` to access the registry.
 *
 * @class
 * @property {Breadcrumb[]} breadcrumbs
 * @property {string} renderHash
 * @method addBreadcrumb
 */
class BreadcrumbRegistry {
  breadcrumbs: Breadcrumb[] = [];
  renderHash: string = '';

  constructor() {
    this.breadcrumbs = flyteBreadcrumbRegistryList;
    this._makeRenderHash();
  }

  /**
   * Hash of breadcrumb ids to be used as a key for rendering
   */
  private _makeRenderHash() {
    this.renderHash = this.breadcrumbs.map(b => b.id).join(',');
  }

  /**
   * Add a breadcrumb to the registry
   * @param breadcrumb
   * @returns
   */
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
      this._makeRenderHash();
      return this.breadcrumbs[existingBreadcrumbIndex];
    }

    this.breadcrumbs.push(breadcrumbData);
    this._makeRenderHash();
    return breadcrumbData;
  }
}

const breadcrumbRegistry = new BreadcrumbRegistry();
export default breadcrumbRegistry;
