import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

export type SearchParams = Record<string, string>;
type TabState = [SearchParams, (key: string, value?: string) => void];

export const parseQueryParams = (search: string) => {
  const params = new URLSearchParams(search);
  const result: SearchParams = {};
  const keys = [...params.keys()];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = params.get(key);
    result[key] = value || '';
  }
  return result;
};

export const stringifyQueryParams = (params: SearchParams) => {
  return new URLSearchParams(params).toString();
};

/** A hook which allows reading/setting of the current query string params
 * It will attach a listener to history so that components using query params
 * are updated whenever the path/query changes.
 */
export const useQueryState = () => {
  const history = useHistory();
  const { search } = useLocation();

  const initParams = parseQueryParams(search);
  const [params, setParams] = useState(initParams);

  /**
   * Update the router seperately, gaurd against setting the same value twice
   */
  const setHistory = useCallback(
    (newParams: Dictionary<string>) => {
      // has there been a change?
      const searchParams = parseQueryParams(search);
      if (isEqual(searchParams, newParams)) {
        return;
      }

      // updating new
      const newSearch = stringifyQueryParams(newParams);
      const newSearchQ = `?${newSearch}`;
      if (!isEqual(search, newSearchQ)) {
        setParams(newParams);
        history.push({
          search: `${newSearch}`,
        });
      }
    },
    [search, params],
  );

  // callback to set a single value in the query string and memory
  const setQueryStateValue = (key: string, value = '') => {
    const newParams = { ...params, [key]: value };
    // remove empty values from object
    const filteredParams = pickBy(newParams, (v) => !!v?.length);
    setParams(filteredParams);
    setHistory(filteredParams);
  };

  const updateSearch = useCallback(
    (search) => {
      const newParams = parseQueryParams(search);
      if (!isEqual(params, newParams)) {
        setParams(newParams);
      }
    },
    [setParams, params],
  );

  useEffect(() => {
    updateSearch(search);
  }, [search]);

  return [params, setQueryStateValue] as TabState;
};
