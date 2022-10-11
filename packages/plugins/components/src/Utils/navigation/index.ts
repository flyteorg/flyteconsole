import { env } from '../environment';

let baseUrl = env.BASE_URL ? env.BASE_URL : '';
if (baseUrl.length && baseUrl[0] !== '/') {
  baseUrl = `/${baseUrl}`;
}

export const makeRoute = (path: string) => `${baseUrl}${path}`;

export const getBasePathName = () => {
  const pathName = window.location.pathname;

  return `/${pathName?.split('/')?.[1]}`;
};
