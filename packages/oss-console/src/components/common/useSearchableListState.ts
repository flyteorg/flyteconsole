/* eslint-disable no-undef */
import fuzzysort from 'fuzzysort';
import React, { createElement, useMemo, useState } from 'react';
import get from 'lodash/get';
import { createDebugLogger } from '../../common/log';

const debug = createDebugLogger('@useSearchableListState');

interface SearchTarget<T> {
  value: T;
  prepared: Fuzzysort.Prepared | undefined;
}

export type PropertyGetter<T> = (item: T) => string;

/** A displayable search result item */
export interface SearchResult<T> {
  /** Undecorated string identifying the item */
  key: string;
  /** (Potentially) decorated string of HTML to be displayed */
  content: React.ReactNode;
  /** The raw value of the item */
  value: T;
  result?: Fuzzysort.KeyResult<SearchTarget<T>>;
}

export interface SearchableListStateArgs<T> {
  items: T[];
  propertyGetter: keyof T | PropertyGetter<T>;
}

function getProperty<T>(item: T, getter: keyof T | PropertyGetter<T>): string {
  return typeof getter === 'function' ? getter(item) : get(item, getter);
}

/** Generates a plain list of un-highlighted search results */
function toSearchResults<T>(items: T[], getter: keyof T | PropertyGetter<T>): SearchResult<T>[] {
  const result = items.map((item) => {
    const property = getProperty(item, getter);
    return {
      ...item,
      content: property,
      key: property,
      value: item,
    };
  });
  debug('toSearchResults', { result, getter });
  return result;
}

export const createHighlightedEntitySearchResult = <T extends {}>(
  result: Fuzzysort.KeyResult<SearchTarget<T>>,
  highlightElement = 'mark',
) => {
  const highlightedResult = fuzzysort.highlight(result, (m, i) =>
    createElement(highlightElement, { key: i }, m),
  );
  debug('createHighlightedEntitySearchResult', highlightedResult);

  return highlightedResult;
};

/** Converts a prepared list of search targets into a list of search results */
function getFilteredItems<T extends {}>(
  targets: SearchTarget<T>[],
  getter: keyof T | PropertyGetter<T>,
  searchString: string,
): SearchResult<T>[] {
  const results = fuzzysort.go<SearchTarget<T>>(searchString, targets, {
    key: 'prepared',
  });

  const mappedResult = results.map((result) => {
    const property = getProperty(result.obj.value, getter);
    return {
      content: property,
      key: result.target,
      value: result.obj.value,
      result,
    };
  });
  debug('getFilteredItems', { searchString, mappedResult });
  return mappedResult;
}

/** Manages state for fuzzy-matching a set of items by a search string, with the
 * resulting list of items being highlighted where characters in the search
 * string match characters in the item
 */
export const useSearchableListState = <T extends {}>({
  items,
  propertyGetter,
}: SearchableListStateArgs<T>) => {
  const [searchString, setSearchString] = useState('');

  const { results, loading = true } = useMemo(() => {
    const unfilteredResults = toSearchResults(items, propertyGetter);
    const preparedItems = items.map((value) => ({
      value,
      prepared: fuzzysort.prepare(getProperty(value, propertyGetter)),
    }));
    const results =
      searchString.length === 0
        ? unfilteredResults
        : getFilteredItems(preparedItems, propertyGetter, searchString);
    debug('useSearchableListState', { results, searchString });
    return { results, loading: false };
  }, [searchString, items]);
  return {
    results,
    searchString,
    setSearchString,
    loading,
  };
};
/* eslint-enable no-undef */
