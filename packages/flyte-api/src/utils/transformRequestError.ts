import { AxiosError } from 'axios';
import Admin from '@clients/common/flyteidl/admin';
import NotFoundError from '@clients/common/Errors/NotFoundError';
import NotAuthorizedError from '@clients/common/Errors/NotAuthorizedError';
import { decodeProtoResponse } from '@clients/common/Utils/decodeProtoResponse';

// to enrich the error message by adding the response
function decodeErrorResponseMessage(error: AxiosError) {
  try {
    // probablly using a wrong decode type.. is there a decode type for the error message?
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

/** Detects special cases for errors returned from Axios and lets others pass through. */
export function transformRequestError(err: unknown, path: string, decodeError = false) {
  const error = err as AxiosError;

  if (!error.response) {
    return error;
  }

  // For some status codes, we'll throw a special error to allow
  // client code and components to handle separately
  if (error.response.status === 404) {
    return new NotFoundError(path);
  }
  if (error.response.status === 401) {
    return new NotAuthorizedError();
  }

  if (decodeError) {
    return decodeErrorResponseMessage(error);
  }

  // this error is not decoded.
  return error;
}

export default transformRequestError;
