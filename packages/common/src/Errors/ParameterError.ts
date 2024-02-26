/* eslint-disable max-classes-per-file */
/** Indicates a generic problem with a function parameter */
export class ParameterError extends Error {
  constructor(public override name: string, msg: string) {
    super(msg);
  }
}
