import HttpRequestError from '@clients/common/Errors/HttpRequestError';
import Admin from '@clients/common/flyteidl/admin';
import NotFoundError from '@clients/common/Errors/NotFoundError';
import NotAuthorizedError from '@clients/common/Errors/NotAuthorizedError';
import { decodeProtoResponse } from '@clients/common/Utils/decodeProtoResponse';

function decodeErrorResponseMessage(error: HttpRequestError) {
  try {
    const decodedErrorResponseMessage = decodeProtoResponse(
      error.response?.data as any,
      Admin.RawOutputDataConfig,
    );
    if (decodedErrorResponseMessage && decodedErrorResponseMessage.outputLocationPrefix) {
      const errorStatusMessage = error?.message;
      const errorResponseMessage = decodedErrorResponseMessage.outputLocationPrefix;

      return new Error(`${errorStatusMessage} ${errorResponseMessage}`);
    }
  } catch (err) {
    // do nothing
  }
  return error;
}

/** Detects special cases for HTTP errors and lets others pass through. */
export function transformRequestError(err: unknown, path: string, decodeError = false) {
  const error = err as HttpRequestError;

  if (!error.response) {
    return error;
  }

  if (error.response.status === 404) {
    return new NotFoundError(path);
  }
  if (error.response.status === 401) {
    return new NotAuthorizedError();
  }

  if (decodeError) {
    return decodeErrorResponseMessage(error);
  }

  return error;
}

export default transformRequestError;
