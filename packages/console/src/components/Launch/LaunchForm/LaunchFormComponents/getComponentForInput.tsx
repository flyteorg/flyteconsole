import React, { useState } from 'react';
import { getHelperForInput } from '../inputHelpers/getHelperForInput';
import { InputProps, InputType, InputValue } from '../types';
import { UnionInput } from './UnionInput';
import { BlobInput } from './BlobInput';
import { CollectionInput } from './CollectionInput';
import { StructInput } from './StructInput';
import { MapInput } from '../MapInput';
import { UnsupportedInput } from './UnsupportedInput';
import { NoneInput } from './NoneInput';
import { SimpleInput } from './SimpleInput';

export function getComponentForInput(
  input: InputProps,
  showErrors: boolean,
  setIsError: (boolean) => void,
) {
  const [error, setError] = useState<string | undefined>();

  const onChange = (newValue: InputValue) => {
    const helper = getHelperForInput(input.typeDefinition.type);
    try {
      helper.validate({ ...input, value: newValue });
      setIsError(false);
      setError(undefined);
    } catch (e) {
      setError(e.message);
      setIsError(true);
    }
    input.onChange(newValue);
  };

  const props = {
    ...input,
    ...(error && showErrors ? { error: error } : {}),
    setIsError,
    onChange,
  };

  switch (input.typeDefinition.type) {
    case InputType.Union:
      return <UnionInput {...props} />;
    case InputType.Blob:
      return <BlobInput {...props} />;
    case InputType.Collection:
      return <CollectionInput {...props} />;
    case InputType.Struct:
      return <StructInput {...props} />;
    case InputType.Map:
      return <MapInput {...props} />;
    case InputType.Unknown:
      return <UnsupportedInput {...props} />;
    case InputType.None:
      return <NoneInput {...props} />;
    default:
      // handles Boolean, Datetime, Schema, String, Integer, Float, Duration, Enum
      return <SimpleInput {...props} />;
  }
}
