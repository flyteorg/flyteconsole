import RawEndpoint from './RawEndpoint';
import createLocalURL from './createLocalURL';

/** Updates Enpoint url depending on admin domain */
export function getEndpointUrl(endpoint: RawEndpoint | string, adminUrl?: string) {
  if (adminUrl) {
    return `${adminUrl}${endpoint}`;
  }

  return createLocalURL(endpoint);
}

export default getEndpointUrl;
