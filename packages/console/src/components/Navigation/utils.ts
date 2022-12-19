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
  return flyteNavigation;
};
