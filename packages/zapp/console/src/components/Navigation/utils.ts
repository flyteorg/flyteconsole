import { FlyteNavigation, env } from '@flyteconsole/components';

export const getFlyteNavigationData = (): FlyteNavigation | undefined => {
  return env.FLYTE_NAVIGATION ? JSON.parse(env.FLYTE_NAVIGATION) : undefined;
};
