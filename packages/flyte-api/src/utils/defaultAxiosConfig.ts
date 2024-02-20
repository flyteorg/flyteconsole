import axios, {
  AxiosRequestConfig,
  AxiosRequestTransformer,
  AxiosResponseTransformer,
} from 'axios';
import snakecaseKeys from 'snakecase-keys';
import camelcaseKeys from 'camelcase-keys';
import isObject from './isObject';

/** Config object that can be used for requests that are not sent to
 * the Admin entity API (`/api/v1/...`), such as the `/me` endpoint. This config
 * ensures that requests/responses are correctly converted and that cookies are
 * included.
 */
export const defaultAxiosConfig: AxiosRequestConfig = {
  transformRequest: [
    (data: any) => (isObject(data) ? snakecaseKeys(data) : data),
    ...(axios.defaults.transformRequest as AxiosRequestTransformer[]),
  ],
  transformResponse: [
    ...(axios.defaults.transformResponse as AxiosResponseTransformer[] as any),
    camelcaseKeys,
  ],
  withCredentials: true,
};

export default defaultAxiosConfig;
