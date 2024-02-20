import { useContext } from 'react';
import { FeatureFlagContext } from './FeatureFlagContext';

export const useFeatureFlags = () => {
  return useContext(FeatureFlagContext);
};
