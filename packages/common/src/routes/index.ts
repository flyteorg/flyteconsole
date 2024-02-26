import { env } from '../environment';

export const removeTrailingSlash = (pathName: string): string => {
  return pathName.replace(/\/+$/, '');
};

export const basePath = env?.BASE_HREF ? removeTrailingSlash(new URL(env!.BASE_HREF).pathname) : '';

export const pathnameWithoutBasePath = () => {
  const pathnameWindow = window?.location?.pathname ?? '';
  const pathnameTrimBase = pathnameWindow.startsWith(basePath)
    ? pathnameWindow.replace(basePath, '')
    : pathnameWindow;

  return pathnameTrimBase;
};

export const legacyConsoleRouteSection = () => {
  const isConsoleDisabled = env.DISABLE_CONSOLE_ROUTE_PREFIX === 'true';
  if (isConsoleDisabled) {
    return '';
  }

  // backwords compatibility for legacy console routes
  const isConsolePathname = (window?.location?.pathname ?? '').startsWith('/console');
  const isDashboardPathname = (window?.location?.pathname ?? '').includes('/dashboard');

  const isLegacyConsoleRoute = isConsolePathname && !isDashboardPathname;
  const dashboardUseConsole = isDashboardPathname && !isConsoleDisabled;

  const consoleSection = isLegacyConsoleRoute || dashboardUseConsole ? '/console' : '';

  return consoleSection;
};

export const makeOrgAwarePath = (routePath = '/') => {
  const consoleSection = !routePath.startsWith('/dashboard') ? legacyConsoleRouteSection() : '';

  return `${basePath}${consoleSection}${routePath}`;
};

export const makeOrgAwarePathPattern = (routePattern = '/') => {
  const consoleSection = !routePattern.startsWith('/dashboard') ? legacyConsoleRouteSection() : '';
  return `${basePath}${consoleSection}${routePattern}`;
};

export const makeRoute = (path: string) => {
  return `${makeOrgAwarePath(removeTrailingSlash(`${path}`))}`;
};

export const makePathPattern = (pattern: string) => {
  return `${makeOrgAwarePathPattern(`${pattern}`)}`;
};
