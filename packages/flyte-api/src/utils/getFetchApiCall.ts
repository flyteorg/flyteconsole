import { flyteJsonGet } from './defaultFetchConfig';
import { transformRequestError } from './transformRequestError';

/** JSON GET for Flyte API paths; returns null and logs on failure. */
export const getFetchApiCall = async <T>(path: string): Promise<T | null> => {
  try {
    return await flyteJsonGet<T>(path);
  } catch (e) {
    const { message } = transformRequestError(e, path);
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch data: ${message}`);
    return null;
  }
};

export default getFetchApiCall;
