import React, { createContext, useContext } from 'react';
import AdminEndpoint from '../utils/AdminEndpoint';
import { defaultLoginStatus, getLoginUrl, getLogoutUrl, LoginStatus } from './login';
import getEndpointUrl from '../utils/getEndpointUrl';
import RawEndpoint from '../utils/RawEndpoint';
import getAdminApiUrl from '../utils/getAdminApiUrl';

export interface FlyteApiContextState {
  loginStatus: LoginStatus;
  getLoginUrl: (redirect?: string) => string;
  getLogoutUrl: (redirect?: string) => string;
  getProfileUrl: () => string;
  getAdminApiUrl: (endpoint: AdminEndpoint | string) => string;
}

const FlyteApiContext = createContext<FlyteApiContextState>({
  // default values - used when Provider wrapper is not found
  loginStatus: defaultLoginStatus,
  getLoginUrl: () => '#',
  getLogoutUrl: () => '#',
  getProfileUrl: () => '#',
  getAdminApiUrl: () => '#',
});

interface FlyteApiProviderProps {
  flyteApiDomain?: string;
  disableAutomaticLogin?: boolean;
  children?: React.ReactNode;
}

export const useFlyteApi = () => useContext(FlyteApiContext);

export const FlyteApiProvider = (props: FlyteApiProviderProps) => {
  const { flyteApiDomain, disableAutomaticLogin, children } = props;

  const [loginExpired, setLoginExpired] = React.useState(false);

  // Whenever we detect expired credentials, trigger a login redirect automatically
  React.useEffect(() => {
    if (!disableAutomaticLogin && loginExpired) {
      window.location.href = getLoginUrl(flyteApiDomain);
    }
  }, [loginExpired]);

  return (
    <FlyteApiContext.Provider
      value={{
        loginStatus: {
          expired: loginExpired,
          setExpired: setLoginExpired,
        },
        getLoginUrl: (redirect) => getLoginUrl(flyteApiDomain, redirect),
        getLogoutUrl: (redirect) => getLogoutUrl(flyteApiDomain, redirect),
        getProfileUrl: () => getEndpointUrl(RawEndpoint.Profile, flyteApiDomain),
        getAdminApiUrl: (endpoint) => getAdminApiUrl(endpoint, flyteApiDomain),
      }}
    >
      {children}
    </FlyteApiContext.Provider>
  );
};

export default FlyteApiProvider;
