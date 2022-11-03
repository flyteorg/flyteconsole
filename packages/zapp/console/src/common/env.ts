import { Env } from 'config/types';

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
// tslint:disable-next-line:no-any
export const env: Env = Object.assign({}, process.env, window.env);

export const isDevEnv = () => env.NODE_ENV === 'development';
export const isTestEnv = () => env.NODE_ENV === 'test';
