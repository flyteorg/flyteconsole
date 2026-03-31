import {
  AdminEntityTransformer,
  DecodableType,
  EncodableType,
  RequestConfig,
} from '@clients/common/types/adminEntityTypes';
import { decodeProtoResponse } from '@clients/common/Utils/decodeProtoResponse';
import { transformRequestError } from '@clients/flyte-api/utils/transformRequestError';
import { AdminRequestBody, fetchClient } from '@clients/oss-console/components/data/fetchClient';
import { generateAdminApiQuery } from './AdminApiQuery';
import { adminApiUrl, encodeProtoPayload, logProtoResponse } from './utils';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Base work function used by the HTTP verb methods below. It does not handle
 * encoding/decoding of protobuf.
 */
async function request(
  /** HTTP verb to use */
  method: HttpMethod,
  /** API endpoint to use, should not include protocol/host/prefix */
  endpoint: string,
  /** Admin API options to use for the request */
  config: RequestConfig = {},
) {
  const { ADMIN_REQUEST_HEADERS } = process.env;
  const headers: Record<string, string> = { Accept: 'application/octet-stream' };

  const params = { ...config.params, ...generateAdminApiQuery(config) };

  if (config.data) {
    headers['Content-Type'] = 'application/octet-stream';
  }

  if (ADMIN_REQUEST_HEADERS) {
    ADMIN_REQUEST_HEADERS.split(';')?.map((str) => {
      const [key, value] = str.split(':');
      if (key && value) {
        headers[key] = value[0] === "'" ? value.substring(1, -1) : value;
      }
    });
  }

  try {
    const { data } = await fetchClient.request<ArrayBuffer>({
      method,
      url: adminApiUrl(endpoint),
      params,
      headers,
      data: config.data != null ? (config.data as AdminRequestBody) : undefined,
    });
    return data;
  } catch (e) {
    throw transformRequestError(e, endpoint, true);
  }
}

export interface GetEntityParams<T, TransformedType> {
  path: string;
  messageType: DecodableType<T>;
  transform?: AdminEntityTransformer<T, TransformedType>;
}

function identityTransformer(msg: any) {
  return msg;
}

/** GETs an entity by path and decodes/transforms it using provided functions */
export async function getAdminEntity<ResponseType, TransformedType>(
  {
    path,
    messageType,
    transform = identityTransformer,
  }: GetEntityParams<ResponseType, TransformedType>,
  config?: RequestConfig,
): Promise<TransformedType> {
  const data: ArrayBuffer = await request('get', path, config);
  const decoded = decodeProtoResponse(data, messageType);
  logProtoResponse(path, decoded);
  return transform(decoded) as TransformedType;
}

export interface PostEntityParams<RequestType, ResponseType, TransformedType> {
  data: RequestType;
  path: string;
  method?: HttpMethod;
  requestMessageType: EncodableType<RequestType>;
  responseMessageType: DecodableType<ResponseType>;
  transform?: AdminEntityTransformer<ResponseType, TransformedType>;
}

/** POSTs an entity, encoded as protobuf, by path and decodes/transforms it
 * using the provided request and response message types.
 */
export async function postAdminEntity<RequestType, ResponseType, TransformedType = ResponseType>(
  {
    path,
    data,
    method = 'post',
    requestMessageType,
    responseMessageType,
    transform = identityTransformer,
  }: PostEntityParams<RequestType, ResponseType, TransformedType>,
  config?: RequestConfig,
): Promise<TransformedType> {
  const body = encodeProtoPayload(data, requestMessageType);
  const responseData: ArrayBuffer = await request(method, path, { ...config, data: body });
  const decoded = decodeProtoResponse(responseData, responseMessageType);
  logProtoResponse(path, decoded);
  return transform(decoded) as TransformedType;
}
