import React, { FC } from 'react';
import { log } from 'common/log';
import {
  InputProps,
  InputType,
  InputTypeDefinition,
  InputValue,
} from '../types';
import { UnsupportedInput } from './UnsupportedInput';
import { isSimpleType } from './SimpleInput';
import { getHelperForInput } from '../inputHelpers/getHelperForInput';
import { getComponentForInput } from './getComponentForInput';
import { ConverterInput, InputHelper } from '../inputHelpers/types';

const tryGetCollectionValue = (
  input: ConverterInput,
  typeDefinition: InputTypeDefinition,
  helper: InputHelper,
) => {
  let collectionLiteral: InputValue | undefined;
  try {
    const literal = helper.toLiteral(input);
    collectionLiteral = literal.collection?.literals?.map(subInput => {
      if (typeDefinition?.subtype?.type) {
        const subInputHelper = getHelperForInput(typeDefinition?.subtype?.type);
        return subInputHelper.fromLiteral(subInput, typeDefinition?.subtype);
      }
      return;
    });
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

  const isTextSubType =
    isSimpleType(subtype.type) || subtype.type === InputType.Collection;

  // TODO: handle collection  multiple items correctly instead of just taking the first one
  const subtypeInitialValue = propsInitialValue?.collection?.literals?.[0];
  const subtypeValue = isTextSubType
    ? value
    : tryGetCollectionValue(
        { value, typeDefinition } as any,
        typeDefinition,
        helper,
      )?.[0] || value;

  const newprops: any = {
    ...props,
    initialValue: subtypeInitialValue,
    value: subtypeValue,
    typeDefinition: typeDefinition.subtype,
    onChange: (input: InputValue) => {
      if (isTextSubType) {
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
