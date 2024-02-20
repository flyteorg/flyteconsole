import { ParameterError } from './ParameterError';

/** Indicates that the provided parameter value is invalid */
export class ValueError extends ParameterError {
  constructor(public override name: string, msg = 'Invalid value') {
    super(name, msg);
  }
}

export default ValueError;
