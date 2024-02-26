import { env as commonEnv, Env } from '@clients/common/environment';

const envVariables = { ...commonEnv };

export const currentAdminDomain = window.location.hostname.replace('localhost.', '');

if (!envVariables.ADMIN_API_URL) {
  envVariables.ADMIN_API_URL = currentAdminDomain;
  envVariables.ADMIN_API = `${window.location.protocol}//${currentAdminDomain}`;
}

export const env: Env = envVariables;
