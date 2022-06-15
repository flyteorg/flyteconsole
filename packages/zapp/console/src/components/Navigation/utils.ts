import { env } from 'common/env';

export interface FlyteNavItem {
  title: string;
  url: string;
}

export interface FlyteNavigation {
  color?: string;
  background?: string;
  items: FlyteNavItem[];
}

export const FlyteNavData: FlyteNavigation = env.FLYTE_NAVIGATION
  ? JSON.parse(env.FLYTE_NAVIGATION)
  : undefined;
