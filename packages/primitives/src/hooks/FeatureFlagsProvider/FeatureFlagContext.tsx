import React from 'react';
import { FeatureFlags, FeatureFlagsEnum, defaultFlags } from './defaultFlags';

export type FeatureFlagContextType = FeatureFlags & {
  isFlagEnabled: (flagName: FeatureFlagsEnum) => boolean;
};

const defaultBehaviour: FeatureFlagContextType = {
  isFlagEnabled: () => false,
  ...defaultFlags,
};

export const FeatureFlagContext = React.createContext<FeatureFlagContextType>(defaultBehaviour);
