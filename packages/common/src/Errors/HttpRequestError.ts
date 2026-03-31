/** Response shape attached to failed `fetch` calls (mirrors prior axios-style errors). */
export interface HttpErrorResponse {
  status: number;
  statusText?: string;
  data?: unknown;
}

/** Error thrown when an HTTP request returns a non-OK status or fails in a way we normalize. */
export default class HttpRequestError extends Error {
  response?: HttpErrorResponse;

  constructor(message: string, response?: HttpErrorResponse) {
    super(message);
    this.name = 'HttpRequestError';
    this.response = response;
    Object.setPrototypeOf(this, HttpRequestError.prototype);
  }
}
