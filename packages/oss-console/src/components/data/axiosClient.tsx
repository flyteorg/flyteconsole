import { env } from '@clients/common/environment';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { onlineManager } from 'react-query';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

export const axioClient = axios.create({
  baseURL: env.ADMIN_API_URL,
  withCredentials: true,
  maxRedirects: 0,
});

export const refreshAuth = async (axiosError?: AxiosError, isChunk?: boolean) => {
  if (axiosError?.response?.status !== 401 && !isChunk) {
    return;
  }
  return axioClient
    .get(`${env.ADMIN_API_URL}/login?redirect_url=${env.BASE_URL}/select-project`, {
      withCredentials: true,
      headers: {
        Accept: 'text/html',
      },
      responseType: 'text',
      maxRedirects: 5,
    })
    .then((res) => {
      const redirectUrl = `${env.ADMIN_API_URL}${env.BASE_URL}/select-project`;
      if (res.request.responseURL.includes(redirectUrl)) {
        onlineManager.setOnline(true);
        return res;
      }

      // throw error if not redirected to the console app
      throw new Error();
    })
    .catch((_error) => {
      onlineManager.setOnline(false);

      const unauthError = isChunk
        ? new AxiosError('Not Authorized', '401', undefined, undefined, {
            status: 401,
            statusText: 'Not Authorized',
          } as AxiosResponse)
        : axiosError;

      return Promise.reject(unauthError);
    });
};

createAuthRefreshInterceptor(axioClient, refreshAuth, {
  statusCodes: [401], // default: [ 401 ]
  pauseInstanceWhileRefreshing: true,
  retryInstance: axioClient,
  interceptNetworkError: true,
});
