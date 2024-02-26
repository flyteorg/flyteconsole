/** Indicates failure to fetch a resource because the user is not authorized (401) */
export class NotAuthorizedError extends Error {
  constructor(msg = 'User is not authorized to view this resource') {
    super(msg);
  }
}

export default NotAuthorizedError;
