import { Env } from '@flyteconsole/components';
type Dictionary<T> = { [k: string]: T };

declare global {
  export interface Window {
    __INITIAL_DATA__?: {
      config?: Dictionary<object>;
    };
    env: Env;
  }
}
