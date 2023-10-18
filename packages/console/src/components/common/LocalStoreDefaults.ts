import { Routes } from 'routes';

export const LOCAL_STORE_DEFAULTS = 'flyteDefaults';
export const LOCAL_PROJECT_DOMAIN = 'projectDomain';

export interface LocalStorageRecord {
  [key: string]: any;
}

/**
 * Use: skipping project select page is value is present
 */
export type LocalStorageProjectDomain = {
  project: string;
  domain: string;
};

/**
 * Generic localStorage interface
 */
export interface LocalStoreDefaults {
  projectDomain?: LocalStorageProjectDomain;
}

/**
 * Queries localStorage for flye values. If a query key is provided it will
 * check for only that key (and return false otherwise) else return the entire
 * JSON
 *
 * @param key   Optional param to return just one key from localStorage
 * @returns     value or false
 */
export const getLocalStore = (key: string | null = null): any | false => {
  const localStoreDefaults = localStorage.getItem(LOCAL_STORE_DEFAULTS);
  if (!localStoreDefaults) {
    return false;
  }
  const localJSON = JSON.parse(localStoreDefaults) as LocalStoreDefaults;
  if (key) {
    if (localJSON[key]) {
      return localJSON[key];
    } else {
      return false;
    }
  } else {
    return localJSON;
  }
};

/**
 * Sets values to 'flyteDefaults' for use in persisting various user defaults.
 */
export const setLocalStore = (key: string, value: any) => {
  /**
   * TODO: the Routes.SelectProject.id check should be removed once we phase out the
           local storage bug that leads to 404
   */
  if (
    key === LOCAL_PROJECT_DOMAIN &&
    value.project === Routes.SelectProject.id
  ) {
    return;
  }
  const localStoreDefaults = localStorage.getItem(LOCAL_STORE_DEFAULTS) || '{}';
  const storeDefaultsJSON = JSON.parse(
    localStoreDefaults,
  ) as LocalStoreDefaults;
  storeDefaultsJSON[key] = value;
  localStorage.setItem(LOCAL_STORE_DEFAULTS, JSON.stringify(storeDefaultsJSON));
};
