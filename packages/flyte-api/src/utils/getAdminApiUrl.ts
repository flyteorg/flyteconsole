import AdminEndpoint from './AdminEndpoint';
import adminApiPrefix from './adminApiPrefix';
import createLocalURL from './createLocalURL';
import ensureSlashPrefixed from './ensureSlashPrefixed';

/** Adds admin api prefix to domain Url */
export function getAdminApiUrl(endpoint: AdminEndpoint | string, adminUrl?: string) {
  const finalUrl = `${adminApiPrefix}${ensureSlashPrefixed(endpoint)}`;

  if (adminUrl) {
    return `${adminUrl}${finalUrl}`;
  }

  return createLocalURL(finalUrl);
}

export default getAdminApiUrl;
