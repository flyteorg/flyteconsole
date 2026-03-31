import { env } from '@clients/common/environment';
import HttpRequestError from '@clients/common/Errors/HttpRequestError';
import { onlineManager } from 'react-query';

export type AdminRequestConfig = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: BodyInit | null;
  /** If true, skip 401 refresh + retry (e.g. login probe inside refresh). */
  skipAuthRefresh?: boolean;
};

let refreshInFlight: Promise<void> | null = null;

function queueRefresh(fn: () => Promise<void>): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = fn().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function appendQuery(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (!entries.length) return url;
  const usp = new URLSearchParams();
  for (const [k, v] of entries) {
    usp.set(k, String(v));
  }
  const q = usp.toString();
  if (!q) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${q}`;
}

export const refreshAuth = async (httpError?: HttpRequestError, isChunk?: boolean) => {
  if (httpError?.response?.status !== 401 && !isChunk) {
    return;
  }
  return fetch(
    `${env.ADMIN_API_URL}/login?redirect_url=${env.BASE_URL}/select-project`,
    {
      credentials: 'include',
      redirect: 'follow',
      headers: {
        Accept: 'text/html',
      },
    },
  )
    .then((res) => {
      const redirectUrl = `${env.ADMIN_API_URL}${env.BASE_URL}/select-project`;
      if (res.url.includes(redirectUrl)) {
        onlineManager.setOnline(true);
        return res;
      }
      throw new Error();
    })
    .catch(() => {
      onlineManager.setOnline(false);
      const unauthError = isChunk
        ? new HttpRequestError('Not Authorized', { status: 401, statusText: 'Not Authorized' })
        : httpError;
      return Promise.reject(unauthError);
    });
};

export const axioClient = {
  async request<T = ArrayBuffer>(config: AdminRequestConfig): Promise<{ data: T }> {
    const skipRefresh = config.skipAuthRefresh === true;

    const doFetch = () => {
      const url = appendQuery(config.url, config.params);
      const method = (config.method || 'get').toUpperCase();
      const init: RequestInit = {
        method,
        credentials: 'include',
        redirect: 'error',
        headers: config.headers,
      };
      if (method !== 'GET' && method !== 'HEAD' && config.data != null) {
        init.body = config.data as BodyInit;
      }
      return fetch(url, init);
    };

    let res = await doFetch();

    if (res.status === 401 && !skipRefresh) {
      await queueRefresh(() =>
        refreshAuth(
          new HttpRequestError(res.statusText, { status: 401, statusText: res.statusText }),
          false,
        ),
      );
      res = await doFetch();
    }

    if (!res.ok) {
      const data = await res.arrayBuffer();
      throw new HttpRequestError(res.statusText || 'Request failed', {
        status: res.status,
        statusText: res.statusText,
        data,
      });
    }

    const data = (await res.arrayBuffer()) as T;
    return { data };
  },
};
