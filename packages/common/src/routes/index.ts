import { env } from '../environment';

export const removeTrailingSlash = (pathName: string): string => {
  return pathName.replace(/\/+$/, '');
};

export const makeRoute = (path: string) => removeTrailingSlash(`${env.BASE_URL}${path}`);

let baseUrl = env.BASE_URL ? env.BASE_URL : '';
if (baseUrl.length && baseUrl[0] !== '/') {
  baseUrl = `/${baseUrl}`;
}
