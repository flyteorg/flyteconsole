import { env } from '@clients/common/environment';
import HttpRequestError from '@clients/common/Errors/HttpRequestError';
import { onlineManager } from 'react-query';

/** Derived from `fetch` so eslint `no-undef` does not require DOM globals as identifiers. */
type FetchRequestInit = NonNullable<Parameters<typeof fetch>[1]>;
export type AdminRequestBody = NonNullable<FetchRequestInit['body']>;

export type AdminRequestConfig = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: AdminRequestBody | null;
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

function isRedirectResponse(res: Response): boolean {
  if (res.type === 'opaqueredirect') {
    return true;
  }
  const { status } = res;
  // 304 Not Modified is 3xx but not a redirect; treat other 3xx like axios maxRedirects:0.
  return status >= 300 && status < 400 && status !== 304;
}

function appendQuery(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (!entries.length) return url;
  const usp = new URLSearchParams();
  entries.forEach(([k, v]) => {
    usp.set(k, String(v));
  });
  const q = usp.toString();
  if (!q) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${q}`;
}

export const refreshAuth = async (httpError?: HttpRequestError, isChunk?: boolean) => {
  if (httpError?.response?.status !== 401 && !isChunk) {
    return;
  }
  return fetch(`${env.ADMIN_API_URL}/login?redirect_url=${env.BASE_URL}/select-project`, {
    credentials: 'include',
    redirect: 'follow',
    headers: {
      Accept: 'text/html',
    },
  })
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

export const fetchClient = {
  async request<T = ArrayBuffer>(config: AdminRequestConfig): Promise<{ data: T }> {
    const skipRefresh = config.skipAuthRefresh === true;

    const doFetch = () => {
      const url = appendQuery(config.url, config.params);
      const method = (config.method || 'get').toUpperCase();
      const init: FetchRequestInit = {
        method,
        credentials: 'include',
        redirect: 'manual',
        headers: config.headers,
      };
      if (method !== 'GET' && method !== 'HEAD' && config.data != null) {
        init.body = config.data;
      }
      return fetch(url, init);
    };

    let res = await doFetch();

    if (isRedirectResponse(res)) {
      throw new HttpRequestError(res.statusText || 'Redirect', {
        status: res.status,
        statusText: res.statusText || 'Redirect',
      });
    }

    if (res.status === 401 && !skipRefresh) {
      await queueRefresh(async () => {
        await refreshAuth(
          new HttpRequestError(res.statusText, { status: 401, statusText: res.statusText }),
          false,
        );
      });
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
