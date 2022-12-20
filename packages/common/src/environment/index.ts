/* eslint import/no-mutable-exports: 1 */
export interface Env extends NodeJS.ProcessEnv {
  ADMIN_API_URL?: string;
  BASE_URL?: string;
  FLYTE_NAVIGATION?: string;

  DISABLE_ANALYTICS?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
  STATUS_URL?: string;
}

/** Represents a plain object where string keys map to values of the same type */
type Dictionary<T> = { [k: string]: T };

declare global {
  export interface Window {
    __INITIAL_DATA__?: {
      config?: Dictionary<object>;
    };
    env: Env;
  }
}

/** equivalent to process.env in server and client */
// eslint-disable-next-line import/no-mutable-exports
export let env: Env = { ...process.env, ...window.env };

export const isDevEnv = () => env.NODE_ENV === 'development';
export const isTestEnv = () => env.NODE_ENV === 'test';

export const updateEnv = (outerEnv: Env) => {
  if (outerEnv) {
    env = { ...env, ...outerEnv };
  }
};
