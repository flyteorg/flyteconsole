import React, { FC, useMemo } from 'react';
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
import { ConverterInput, InputHelper } from '../inputHelpers/types';
import { StyledCard } from './StyledCard';
import { CollectionList } from './CollectionList';
import { getComponentForInput } from './getComponentForInput';

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
  const { typeDefinition, value, onChange, error, label } = props;

  const { subtype, type } = typeDefinition;
  if (!subtype) {
    log.warn(
      'Unexpected missing subtype for collection input',
      props.typeDefinition,
    );
    return <UnsupportedInput {...props} />;
  }

  const helper = getHelperForInput(type);
  const subtypeHelper = getHelperForInput(subtype.type);

  const { isTextSubType, newprops, subtypeDefaultValue } = useMemo(() => {
    const { typeDefinition, initialValue: propsInitialValue } = props;
    const { subtype } = typeDefinition;

    const subtypeDefaultValue = subtypeHelper.typeDefinitionToDefaultValue(
      subtype!,
    );
    const isTextSubType =
      isSimpleType(subtype!.type) ||
      subtype!.type === InputType.Collection ||
      subtype!.type === InputType.Struct;

    const finalValue = isTextSubType
      ? value
      : tryGetCollectionValue(
          { value, typeDefinition } as any,
          typeDefinition,
          helper,
        ) || [subtypeDefaultValue];
    const subtypeInitialValue = propsInitialValue?.collection?.literals as any;

    const newprops: InputProps = {
      ...props,
      value: finalValue,
      initialValue: subtypeInitialValue,
      typeDefinition: typeDefinition.subtype!,
      hasCollectionParent: true,
    };

    return {
      newprops,
      subtypeDefaultValue,
      isTextSubType,
    };
  }, [props]);

  const updateCollection = (inputs: InputValue[]) => {
    let collectionString;
    try {
      const newValue = {
        value: inputs,
        typeDefinition: typeDefinition,
      } as any;
      const collectionLiteral = helper.toLiteral(newValue);
      collectionString = helper.fromLiteral(
        collectionLiteral,
        typeDefinition,
      ) as any;
    } catch (error) {
      collectionString = inputs;
    }

    onChange(collectionString!);
  };

  return isTextSubType ? (
    <>{getComponentForInput(newprops, true)}</>
  ) : (
    <StyledCard error={error} label={label}>
      <CollectionList
        defaultValue={subtypeDefaultValue}
        updateCollection={updateCollection}
        inputProps={newprops}
      />
    </StyledCard>
  );
};
