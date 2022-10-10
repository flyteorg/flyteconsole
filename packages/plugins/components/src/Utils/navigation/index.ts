export const makeRoute = (baseUrl: string, path: string) => `${baseUrl}${path}`;

export const getBasePathName = () => {
  const pathName = window.location.pathname;

  return `/${pathName?.split('/')?.[1]}`;
};
