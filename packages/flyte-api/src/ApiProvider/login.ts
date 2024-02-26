import { env } from '@clients/common/environment';
import getEndpointUrl from '../utils/getEndpointUrl';
import RawEndpoint from '../utils/RawEndpoint';

export interface LoginStatus {
  expired: boolean;
  setExpired(expired: boolean): void;
}

export const defaultLoginStatus: LoginStatus = {
  expired: true,
  setExpired: () => {
    /** Do nothing */
  },
};

/** Constructs a url for redirecting to the Admin login endpoint and returning
 * to the current location after completing the flow.
 */
export function getLoginUrl(adminUrl?: string, redirectUrl: string = window.location.href) {
  const baseUrl = getEndpointUrl(RawEndpoint.Login, adminUrl);
  return `${baseUrl}?redirect_url=${redirectUrl}`;
}

/** Constructs a url for redirecting to the Admin login endpoint and returning
 * to the current location after completing the flow.
 */
export function getLogoutUrl(
  adminUrl?: string,
  redirectUrl: string = `${window.location.origin}${
    env.BASE_URL ? `${env.BASE_URL}` : ''
  }/select-project`,
) {
  const baseUrl = getEndpointUrl(RawEndpoint.Logout, adminUrl);
  return `${baseUrl}?redirect_url=${redirectUrl}`;
}
