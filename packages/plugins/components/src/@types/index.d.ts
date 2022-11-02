import { FeatureFlag } from '@flyteconsole/components';

declare global {
  export interface Window {
    __INITIAL_DATA__?: {
      config?: Dictionary<object>;
    };
    env: Env;
    setFeatureFlag: (flag: FeatureFlag, newValue: boolean) => void;
    getFeatureFlag: (flag: FeatureFlag) => boolean;
    clearRuntimeConfig: () => void;
  }
}

export {};
