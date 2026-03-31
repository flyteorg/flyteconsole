import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import HttpRequestError from '@clients/common/Errors/HttpRequestError';
import isObject from './isObject';

async function readErrorBody(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch {
    return undefined;
  }
}

/**
 * GET JSON with cookies; response objects are camelCased (same behavior as the
 * previous axios + transformResponse stack).
 */
export async function flyteJsonGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  if (!res.ok) {
    const data = await readErrorBody(res);
    throw new HttpRequestError(res.statusText || 'Request failed', {
      status: res.status,
      statusText: res.statusText,
      data,
    });
  }
  const json = await res.json();
  return (isObject(json) ? camelcaseKeys(json) : json) as T;
}

/**
 * POST JSON with cookies; request body objects are snake_cased; response objects camelCased.
 */
export async function flyteJsonPost<T>(path: string, body: unknown): Promise<T> {
  const payload = isObject(body) ? snakecaseKeys(body as Record<string, unknown>) : body;
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await readErrorBody(res);
    throw new HttpRequestError(res.statusText || 'Request failed', {
      status: res.status,
      statusText: res.statusText,
      data,
    });
  }
  const json = await res.json();
  return (isObject(json) ? camelcaseKeys(json) : json) as T;
}

export default { get: flyteJsonGet, post: flyteJsonPost };
