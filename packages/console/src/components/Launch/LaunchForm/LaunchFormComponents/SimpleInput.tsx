import React, { FC } from 'react';
import { DatetimeInput } from './DatetimeInput';
import { InputProps, InputType } from '../types';
import { UnsupportedInput } from './UnsupportedInput';
import { BooleanInput } from './BooleanInput';
import { EnumInput } from './EnumInput';
import { TextInput } from './TextInput';

// Note: keep this in sync with the components that return TextInputs
export function isSimpleType(type: InputType): boolean {
  switch (type) {
    case InputType.Schema:
    case InputType.String:
    case InputType.Integer:
    case InputType.Float:
    case InputType.Duration:
      return true;
    default:
      return false;
  }
}

/** Handles rendering of the input component for any primitive-type input */
export const SimpleInput: FC<InputProps> = props => {
  const {
    typeDefinition: { type },
  } = props;

  switch (type) {
    case InputType.Boolean:
      return <BooleanInput {...props} />;
    case InputType.Datetime:
      return <DatetimeInput {...props} />;
    case InputType.Enum:
      return <EnumInput {...props} />;
    case InputType.Schema:
    case InputType.String:
    case InputType.Integer:
    case InputType.Float:
    case InputType.Duration:
      return <TextInput {...props} />;
    default:
      return <UnsupportedInput {...props} />;
  }
};
