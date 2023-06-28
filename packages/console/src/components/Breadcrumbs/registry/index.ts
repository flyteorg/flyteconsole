import { isEmpty, mergeWith } from 'lodash';
import startCase from 'lodash/startCase';
import {
  Breadcrumb,
  BreadcrumbFormControlInterface,
  BreadcrumbValidatorInterface,
} from '../types';
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
  // Data structure for storing breadcrumbs
  breadcrumbSeeds: Breadcrumb[] = [];
  // Breadcrumbs to render in UI
  breadcrumbs: BreadcrumbFormControlInterface[] = [];
  renderHash: string = '';

  constructor() {
    this.breadcrumbSeeds = flyteBreadcrumbRegistryList;
    this._makeRenderHash();
  }

  /**
   * Hash of breadcrumb ids to be used as a key for rendering
   */
  private _makeRenderHash() {
    this.renderHash =
      this.breadcrumbs.map(b => b.id).join(',') +
      '|' +
      this.breadcrumbSeeds.map(b => b.id).join(',');
  }

  /**
   * Add a breadcrumb to the registry
   * @param breadcrumb
   * @returns
   */
  public addBreadcrumbSeed(breadcrumb: Partial<Breadcrumb>) {
    const breadcrumbData = makeBreadcrumb(breadcrumb);
    const existingBreadcrumbIndex = this.breadcrumbSeeds.findIndex(
      b => b.id === breadcrumb.id,
    );

    if (existingBreadcrumbIndex > -1) {
      const existingBreadcrumb = this.breadcrumbSeeds[existingBreadcrumbIndex];

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

      this.breadcrumbSeeds[existingBreadcrumbIndex] = newBreadcrumb;
      this._makeRenderHash();
      return this.breadcrumbSeeds[existingBreadcrumbIndex];
    }

    this.breadcrumbSeeds.push(breadcrumbData);
    this._makeRenderHash();
    return breadcrumbData;
  }

  public addBreadcrumbController(breadcrumb: BreadcrumbFormControlInterface) {
    const knownIndex = this.breadcrumbs.findIndex(b => b.id === breadcrumb.id);
    if (knownIndex > -1) {
      this.breadcrumbs[knownIndex] = breadcrumb;
    } else {
      this.breadcrumbs.push(breadcrumb);
    }
    this._makeRenderHash();
    return breadcrumb;
  }

  static makeUrlSegments(location: Location, projectId = '', domainId = '') {
    const pathName = location.pathname;
    const basePath = process.env.BASE_PATH || '/console';

    // Remove first occurence of base path
    const pathNameWithoutBasePath = pathName.replace(basePath, '');
    const pathFragments = pathNameWithoutBasePath.split('/').filter(f => !!f);

    // These must always be visible
    // Core routing UX depends on them
    if (pathFragments[0] !== 'projects') {
      pathFragments.unshift(projectId);
      pathFragments.unshift('projects');
    }

    if (pathFragments[2] !== 'domains') {
      pathFragments.splice(2, 0, 'domains');
      pathFragments.splice(3, 0, domainId);
    }

    const values: Record<string, string> = {};

    for (let i = 0; i < pathFragments.length; i = i + 2) {
      const key = decodeURIComponent(pathFragments[i]);
      const value = decodeURIComponent(pathFragments[i + 1]);
      values[key] = value || startCase(key);
    }

    // required segments, always visible
    breadcrumbRegistry.breadcrumbSeeds
      .filter(b => b.required)
      .forEach(b => {
        if (!values[b.id]) {
          const value =
            typeof b.defaultValue === 'function'
              ? b.defaultValue(location, b)
              : b.defaultValue;
          values[b.id] = value || '';
        }
      });

    return { pathEntries: values, pathFragments };
  }

  public resetBreadcrumbs() {
    this.breadcrumbs = [];
    this._makeRenderHash();
  }

  public breadcrumbBuilder({
    location,
    projectId,
    domainId,
  }: {
    location: Location;
    projectId: string;
    domainId: string;
  }): BreadcrumbFormControlInterface[] {
    const { pathEntries, pathFragments } = BreadcrumbRegistry.makeUrlSegments(
      location,
      projectId,
      domainId,
    );

    const url = location.href.replace(location.origin, '');

    const validSeeds: Breadcrumb[] = [];
    for (let i = 0; i < pathFragments.length; i++) {
      const pathFragment = pathFragments[i];
      if (!pathEntries[pathFragment]) continue;

      const prevPathSegment = pathFragments[i - 2] || '';
      const nextPathSegment = pathFragments[i + 2] || '';
      const currentPathValue = pathEntries[pathFragment];

      const seeds = this.breadcrumbSeeds.filter(seed => {
        const targetBreadcrumbId = seed.id;

        const validator: BreadcrumbValidatorInterface = {
          targetBreadcrumbId,
          currentPathSegment: pathFragment,
          currentPathValue: currentPathValue,
          prevPathSegment,
          nextPathSegment,
          url,
        };
        return seed.valididator(validator);
      });

      for (let j = 0; j < seeds.length; j++) {
        if (!seeds[j].defaultValue) seeds[j].defaultValue = currentPathValue;
        validSeeds.push(seeds[j]);
      }
    }

    for (let i = 0; i < validSeeds.length; i++) {
      const validSeed = validSeeds[i];
      const breadcrumb = this.addBreadcrumbSeed(validSeed);

      const value =
        typeof breadcrumb.defaultValue === 'function'
          ? breadcrumb.defaultValue(location, breadcrumb)
          : `${breadcrumb.defaultValue}`;

      const controller: BreadcrumbFormControlInterface = {
        ...breadcrumb,
        value,
        key: `breadcrumb-controller-${breadcrumb.id}`,
        projectId,
        domainId,
      };
      this.addBreadcrumbController(controller);
    }

    return this.breadcrumbs;
  }
}

const breadcrumbRegistry = new BreadcrumbRegistry();
export default breadcrumbRegistry;