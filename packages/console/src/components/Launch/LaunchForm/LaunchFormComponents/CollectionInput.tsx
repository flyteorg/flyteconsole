import React, { FC } from 'react';
import { log } from 'common/log';
import { Core } from '@flyteorg/flyteidl-types';
import { InputProps, InputValue } from '../types';
import { UnsupportedInput } from './UnsupportedInput';
import { isSimpleType } from './SimpleInput';
import { getHelperForInput } from '../inputHelpers/getHelperForInput';
import { getComponentForInput } from './getComponentForInput';
import { ConverterInput, InputHelper } from '../inputHelpers/types';

const tryGetCollectionValue = (input: ConverterInput, helper: InputHelper) => {
  let collectionLiteral: Core.ILiteral | undefined;
  try {
    collectionLiteral = helper.toLiteral(input);
  } catch (error) {
    // no-op
  }

  return collectionLiteral;
};
/** Handles rendering of the input component for a Collection of SimpleType values */
export const CollectionInput: FC<InputProps> = props => {
  const {
    typeDefinition,
    initialValue: propsInitialValue,
    value,
    onChange,
    setIsError,
  } = props;

  const { subtype, type } = typeDefinition;
  if (!subtype) {
    log.warn(
      'Unexpected missing subtype for collection input',
      props.typeDefinition,
    );
    return <UnsupportedInput {...props} />;
  }

  const helper = getHelperForInput(type);

  const isTextSubType = isSimpleType(subtype.type);

  // TODO: handle collection  multiple items correctly
  const subtypeInitialValue = propsInitialValue?.collection?.literals?.[0];
  const subtypeValue = isTextSubType
    ? value
    : tryGetCollectionValue({ value, typeDefinition } as any, helper)
        ?.collection?.literals?.[0];

  const newprops: any = {
    ...props,
    initialValue: subtypeInitialValue,
    value: subtypeValue,
    typeDefinition: typeDefinition.subtype,
    onChange: (input: InputValue) => {
      if (typeof input === 'string') {
        onChange(input!);
      } else {
        const newValue = {
          value: Array.isArray(input) ? input : [input],
          typeDefinition: typeDefinition,
        } as any;

        try {
          const collectionLiteral = helper.toLiteral(newValue);
          const collectionString = helper.fromLiteral(
            collectionLiteral,
            typeDefinition,
          );
          onChange(collectionString!);
        } catch (error) {
          setIsError(true);
        }
      }
    },
  };

  // do not show errors for collection items
  const component = getComponentForInput(newprops, false, props.setIsError);

  return component;
};
