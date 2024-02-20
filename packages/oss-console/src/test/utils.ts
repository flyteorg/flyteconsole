import { prettyDOM } from '@testing-library/react';
import Long from 'long';
import { Logger, setLogger } from 'react-query';
import { createQueryClient } from '../components/data/queryCache';

/** Shorthand for creating a `Long` from a `Number`. */
export const long = (val: number) => Long.fromNumber(val);
/** Stringifies the argument with formatting. */
export const obj = (val: any) => JSON.stringify(val, null, 2);
/** Returns a promise which will never resolve. */
export function pendingPromise<T = any>(): Promise<T> {
  return new Promise(() => {});
}

/** Creates a version of `QueryClient` suitable for use in tests (will not perform
 * any retries). */
export const createTestQueryClient = () =>
  createQueryClient({
    queries: { retry: false },
  });

export interface DelayedPromiseResult<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (value: any) => void;
}

/** Returns a promise which can be manually resolved/rejected. */
export function delayedPromise<T = any>(): DelayedPromiseResult<T> {
  let resolve: (value: any) => void;
  let reject: (value: any) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });
  return {
    promise,
    resolve: (value) => resolve(value),
    reject: (value) => reject(value),
  };
}

/** Returns a promise that will resolve after the given time. Useful in
 * combination with `await` to pause testing for a short amount of time
 */
export function waitFor(timeMS: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMS);
  });
}

const silentLogger: Logger = {
  warn: () => {
    // do nothing
  },
  log: () => {
    // do nothing
  },
  error: () => {
    // do nothing
  },
};
