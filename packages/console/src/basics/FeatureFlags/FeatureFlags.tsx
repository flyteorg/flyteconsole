/**
 * Feature Flag provider - allows a multi-stage development.
 */
import * as React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { isDevEnv, isTestEnv } from '@flyteorg/common';
import {
  defaultFlagConfig,
  FeatureFlag,
  FeatureFlagConfig,
} from './defaultConfig';

export { FeatureFlag } from './defaultConfig';

/**
 * Set feature flag value for current session using URLSearchParams values
 * @param search
 * @returns
 */
const getSearchParamFlags = (search: string): FeatureFlagConfig => {
  const urlParams = new URLSearchParams(search);
  const flags: FeatureFlagConfig = {};
  for (const [key, value] of urlParams.entries()) {
    if (value === 'true') {
      flags[key] = true;
    } else if (value === 'false') {
      flags[key] = false;
    }
  }
  return flags as FeatureFlagConfig;
};

const search: string = window.location.search || '';

// To turn on flag for local development only - update flag value here
// REMOVE change prior to commit
let runtimeConfig: FeatureFlagConfig = {
  ...getSearchParamFlags(search),
  // 'test-flag-true': true,  <== locally turns flag on
};

interface FeatureFlagState {
  flags: FeatureFlagConfig;
  setFeatureFlag: (flag: FeatureFlag, newValue: boolean) => void;
  getFeatureFlag: (flag: FeatureFlag) => boolean;
}

interface FeatureFlagProviderProps {
  externalFlags?: { [k: string]: boolean };
  children?: React.ReactNode;
}

/** FeatureFlagContext - used only if ContextProvider wasn't initialized */
const FeatureFlagContext = createContext<FeatureFlagState>({
  flags: defaultFlagConfig,
  setFeatureFlag: () => {
    /* Provider is not initialized */
  },
  getFeatureFlag: () => false,
});

/** useFeatureFlag - should be used to get flag value */
export const useFeatureFlag = (flag: FeatureFlag) =>
  useContext(FeatureFlagContext).getFeatureFlag(flag);

/** useFeatureFlagContext - could be used to set flags from code */
export const useFeatureFlagContext = () => useContext(FeatureFlagContext);

/** FeatureFlagsProvider - should wrap top level component for Production or feature flag related testing */
export const FeatureFlagsProvider = (props: FeatureFlagProviderProps) => {
  const [flags, setFlags] = useState<FeatureFlagConfig>({
    ...defaultFlagConfig,
    ...props.externalFlags,
    ...runtimeConfig,
  });

  const setFeatureFlag = useCallback((flag: FeatureFlag, newValue: boolean) => {
    runtimeConfig[flag] = newValue;
    setFlags({
      ...defaultFlagConfig,
      ...props.externalFlags,
      ...runtimeConfig,
    });
  }, []);

  const getFeatureFlag = useCallback(
    (flag: FeatureFlag) => {
      if (isDevEnv() && flags[flag] === undefined) {
        throw `Default config value is absent for ${flag}`;
      }
      return flags[flag] ?? false;
    },
    [flags],
  );

  const clearRuntimeConfig = useCallback(() => {
    runtimeConfig = { ...defaultFlagConfig, ...props.externalFlags };
  }, []);

  useEffect(() => {
    if (isDevEnv() || isTestEnv()) {
      // Allow manual change of feature flags from devtools
      window['setFeatureFlag'] = setFeatureFlag;
      window['getFeatureFlag'] = getFeatureFlag;
      if (isTestEnv()) {
        // allow reset flags to default - should be used in testing environment only
        window['clearRuntimeConfig'] = clearRuntimeConfig;
      }
    }
  }, [setFeatureFlag, getFeatureFlag, clearRuntimeConfig]);

  return (
    <FeatureFlagContext.Provider
      value={{ flags, setFeatureFlag, getFeatureFlag }}
    >
      {props.children}
    </FeatureFlagContext.Provider>
  );
};
