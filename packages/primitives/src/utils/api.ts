import format from 'string-template';
import { currentAdminDomain, env } from './environment';
import { RestEndpointOptions } from '../types/rest';

function ensureSlashPrefixed(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export const getAdminDomain = () => {
  if (env?.ADMIN_API_URL) {
    return env.ADMIN_API_URL;
  }

  return currentAdminDomain;
};

const getApiEndpoint = (endPoint: string): string => {
  const adminDomain = getAdminDomain();
  return `//${adminDomain}${ensureSlashPrefixed(endPoint)}`;
};

export const navigate = (destination: string) => {
  window.location.assign(destination);
};

export const getApiEndpointDev = (endPoint: string): string => {
  const adminDomain = getAdminDomain();
  let subdomain = '';
  let port = '';
  if (env.NODE_ENV === 'development') {
    subdomain = 'localhost.';
    port = window.location.port ? `:${window.location.port}` : '';
  }
  return `//${subdomain}${adminDomain}${port}${ensureSlashPrefixed(endPoint)}`;
};

export const getDefaultOrganization = () => {
  const adminDomain = getAdminDomain();
  return adminDomain.split('.')[0] || '';
};

export const defaultOptions: RestEndpointOptions = {
  organization: getDefaultOrganization(),
  limit: 2, // default limit, won't be enough in most cases.
};

export const formatEndpoint = (endpoint: string, options?: any) => {
  const finalEndpoint = format(endpoint, { ...defaultOptions, ...options });
  return getApiEndpoint(finalEndpoint);
};

export const formatEndpointV2 = (endpoint: string, options?: any) => {
  return format(endpoint, { ...defaultOptions, ...options });
};
