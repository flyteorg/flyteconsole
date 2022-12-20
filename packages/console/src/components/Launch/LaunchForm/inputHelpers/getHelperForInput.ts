import { InputType } from '../types';
import { blobHelper } from './blob';
import { booleanHelper } from './boolean';
import { collectionHelper } from './collection';
import { datetimeHelper } from './datetime';
import { durationHelper } from './duration';
import { floatHelper } from './float';
import { integerHelper } from './integer';
import { mapHelper } from './map';
import { noneHelper } from './none';
import { schemaHelper } from './schema';
import { stringHelper } from './string';
import { structHelper } from './struct';
import { unionHelper } from './union';
import { InputHelper } from './types';

const unsupportedHelper = noneHelper;

/** Maps an `InputType` to a function which will convert its value into a `Literal` */
const inputHelpers: Record<InputType, InputHelper> = {
  [InputType.Binary]: noneHelper,
  [InputType.Blob]: blobHelper,
  [InputType.Boolean]: booleanHelper,
  [InputType.Collection]: collectionHelper,
  [InputType.Datetime]: datetimeHelper,
  [InputType.Duration]: durationHelper,
  [InputType.Enum]: stringHelper,
  [InputType.Error]: unsupportedHelper,
  [InputType.Float]: floatHelper,
  [InputType.Integer]: integerHelper,
  [InputType.Map]: mapHelper,
  [InputType.None]: noneHelper,
  [InputType.Schema]: schemaHelper,
  [InputType.String]: stringHelper,
  [InputType.Struct]: structHelper,
  [InputType.Union]: unionHelper,
  [InputType.Unknown]: unsupportedHelper,
};

export function getHelperForInput(type: InputType): InputHelper {
  return inputHelpers[type] || unsupportedHelper;
}
