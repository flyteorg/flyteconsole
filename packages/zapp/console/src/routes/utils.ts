import { env } from '@flyteconsole/components';

let baseUrl = env.BASE_URL ? env.BASE_URL : '';
if (baseUrl.length && baseUrl[0] !== '/') {
  baseUrl = `/${baseUrl}`;
}

export const baseUrlString = baseUrl;
export const makeRoute = (path: string) => `${baseUrl}${path}`;
