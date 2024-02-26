import React, { PropsWithChildren } from 'react';
import { FeatureFlagsEnum } from '../FeatureFlagsProvider/defaultFlags';
import { useFeatureFlags } from '../FeatureFlagsProvider/useFeatureFlags';

export type RestrictedForFeatureFlagsProp = PropsWithChildren<{
  flagName?: FeatureFlagsEnum;
}>;
export const RestrictedForFeatureFlag = ({
  flagName,
  children,
}: RestrictedForFeatureFlagsProp): JSX.Element | null => {
  const { isFlagEnabled } = useFeatureFlags();

  // if feature flag is not provided or is enabled, render the children
  if (!flagName || isFlagEnabled(flagName)) {
    return <>{children}</>;
  }

  return null;
};
