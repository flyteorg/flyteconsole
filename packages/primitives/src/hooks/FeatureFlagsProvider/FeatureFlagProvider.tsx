import React, { PropsWithChildren, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import transform from 'lodash/transform';
import { FeatureFlagContext } from './FeatureFlagContext';
import { FeatureFlags, FeatureFlagsEnum, defaultFlags } from './defaultFlags';

export const FeatureFlagProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { search } = useLocation();

  const searchparams: Record<string, boolean> = useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const params: Record<string, boolean> = {};
    searchParams.forEach((value, key) => {
      params[key] = value === 'true';
    });
    return params;
  }, [search]);

  const providerValue = useMemo(() => {
    const featureFlags: FeatureFlags = transform(
      defaultFlags,
      (result, value, key: FeatureFlagsEnum) => {
        // eslint-disable-next-line no-param-reassign
        result[`${key}`] = searchparams[key] ? !!searchparams[key] : value;
      },
      {} as any as FeatureFlags,
    );

    return {
      ...featureFlags,
      isFlagEnabled: (flagName: FeatureFlagsEnum) => {
        return !!featureFlags?.[flagName];
      },
    };
  }, [searchparams]);

  // This component will render its children wrapped around a IdentityContext's provider whose
  // value is set to the method defined above
  return (
    <FeatureFlagContext.Provider value={providerValue}>{children}</FeatureFlagContext.Provider>
  );
};
