export enum FeatureFlagsEnum {
  default = 'default',
}

export type FeatureFlags = Record<FeatureFlagsEnum, boolean>;

export const defaultFlags: FeatureFlags = {
  default: false,
};
