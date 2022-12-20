import { env } from '@flyteoss/common';
import { flyteNavigation } from 'components/Theme/constants';

export interface FlyteNavItem {
  title: string;
  url: string;
}

export interface FlyteNavigation {
  color?: string;
  background?: string;
  console?: string;
  items: FlyteNavItem[];
}

export const getFlyteNavigationData = (): FlyteNavigation | undefined => {
  if (flyteNavigation) return flyteNavigation;

  return env.FLYTE_NAVIGATION ? JSON.parse(env.FLYTE_NAVIGATION) : undefined;
};
