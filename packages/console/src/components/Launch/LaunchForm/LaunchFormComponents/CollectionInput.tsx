import React, { FC, createRef } from 'react';
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
import { parseCollection } from '../inputHelpers/collection';

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
    isSimpleType(subtype.type) ||
    subtype.type === InputType.Collection ||
    subtype.type === InputType.Struct;

  // TODO: handle collection  multiple items correctly instead of just taking the first one.
  const subtypeInitialValue = propsInitialValue?.collection?.literals?.[0];
  const subtypeValue = isTextSubType
    ? value
    : tryGetCollectionValue(
        { value, typeDefinition } as any,
        typeDefinition,
        helper,
      )?.[0] || value;

  const newprops: InputProps = {
    ...props,
    initialValue: subtypeInitialValue,
    value: subtypeValue,
    typeDefinition: typeDefinition.subtype!,
    ...(subtype.type === InputType.Struct
      ? {
          settings: {
            forceTextField: true,
          },
        }
      : {}),
    onChange: (input: InputValue) => {
      let collectionString = input;

      if (typeof input === 'string') {
        collectionString = input;
      } else {
        try {
          let temp;
          if ((input as any).typeDefinition.type === InputType.None) {
            temp = [input];
          } else {
            const tempValue = (input as any)?.value;
            let collection = parseCollection(tempValue);
            collection = collection?.length ? collection : [tempValue];
            temp = collection?.map(value => {
              return {
                value,
                typeDefinition: (input as any)?.typeDefinition,
              };
            });
          }

          const newValue = {
            value: temp,
            typeDefinition: typeDefinition,
          } as any;
          const collectionLiteral = helper.toLiteral(newValue);
          collectionString = helper.fromLiteral(
            collectionLiteral,
            typeDefinition,
          ) as any;
        } catch (error) {
          collectionString = (input as any)?.value;
          setIsError(true);
        }
      }

      onChange(collectionString!);
    },
  };

  const component = getComponentForInput(
    newprops,
    // do not show errors for collection items
    false,
    props.setIsError,
  );

  return component;
};
