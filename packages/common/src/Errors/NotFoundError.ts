export class NotFoundError extends Error {
  constructor(public override name: string, msg = 'The requested item could not be found') {
    super(msg);
  }
}

export default NotFoundError;
