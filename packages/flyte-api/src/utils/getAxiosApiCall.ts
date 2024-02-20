import axios from 'axios';
import { transformRequestError } from './transformRequestError';
import defaultAxiosConfig from './defaultAxiosConfig';

/**
 * @deprecated Please use `axios-hooks` instead, it will allow you to get full call status.
 * example usage https://www.npmjs.com/package/axios-hooks:
 * const [{ data: profile, loading, errot }] = useAxios({url: path, method: 'GET', ...defaultAxiosConfig});
 */
export const getAxiosApiCall = async <T>(path: string): Promise<T | null> => {
  try {
    const { data } = await axios.get<T>(path, defaultAxiosConfig);
    return data;
  } catch (e) {
    const { message } = transformRequestError(e, path);
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch data: ${message}`);
    return null;
  }
};

export default getAxiosApiCall;
