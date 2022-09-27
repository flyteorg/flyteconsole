import { FlyteNavigation } from '@flyteconsole/components';
import { env } from 'common/env';

export const getFlyteNavigationData = (): FlyteNavigation | undefined => {
  return env.FLYTE_NAVIGATION ? JSON.parse(env.FLYTE_NAVIGATION) : undefined;
};
