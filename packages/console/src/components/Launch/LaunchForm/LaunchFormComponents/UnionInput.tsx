import React, { useEffect, useMemo, useState } from 'react';
import {
  InputProps,
  InputType,
  InputTypeDefinition,
  UnionValue,
  InputValue,
} from '../types';
import { formatType } from '../utils';

import { getHelperForInput } from '../inputHelpers/getHelperForInput';
import {
  SearchableSelector,
  SearchableSelectorOption,
} from './SearchableSelector';
import t from '../../../common/strings';
import { getComponentForInput } from './getComponentForInput';
import { StyledCard } from './StyledCard';

const generateInputTypeToValueMap = (
  listOfSubTypes: InputTypeDefinition[] | undefined,
  initialInputValue: UnionValue | undefined,
  initialType: InputTypeDefinition,
): Record<InputType, UnionValue> | {} => {
  if (!listOfSubTypes?.length) {
    return {};
  }

  const final = listOfSubTypes.reduce(function (map, subType) {
    if (initialInputValue && subType.type === initialType.type) {
      map[subType.type] = initialInputValue;
    } else {
      const subtypeHelper = getHelperForInput(subType.type);
      map[subType.type] = {
        value:
          subtypeHelper?.typeDefinitionToDefaultValue?.(subType) || undefined,
        typeDefinition: subType,
      };
    }
    return map;
  }, {});
  return final;
};

const getInitialInputValue = (props: InputProps): UnionValue => {
  const collectionHelper = getHelperForInput(InputType.Collection);
  const unionHelper = getHelperForInput(props.typeDefinition.type);

  if (props.hasCollectionParent && Array.isArray(props.initialValue)) {
    const collectionValues = props.initialValue.map(literal => {
      const unionValue = unionHelper.fromLiteral(
        literal,
        props.typeDefinition,
      ) as UnionValue;

      return unionValue;
    });

    const subtype =
      collectionValues?.[0]?.typeDefinition ||
      props.typeDefinition.listOfSubTypes?.[0];
    const value = collectionHelper.fromLiteral(
      {
        collection: {
          literals: props.initialValue?.map(l =>
            l?.scalar?.union ? l?.scalar?.union?.value : l,
          ),
        },
      } as any,
      {
        subtype,
      } as any,
    ) as any;

    return {
      value,
      typeDefinition: subtype,
    };
  }

  return (
    props.initialValue &&
    (unionHelper.fromLiteral(
      props.initialValue,
      props.typeDefinition,
    ) as UnionValue as any)
  );
};
const generateSearchableSelectorOption = (
  inputTypeDefinition: InputTypeDefinition,
): SearchableSelectorOption<InputType> => {
  return {
    id: inputTypeDefinition.type,
    data: inputTypeDefinition.type,
    name: formatType(inputTypeDefinition),
  } as SearchableSelectorOption<InputType>;
};

const generateListOfSearchableSelectorOptions = (
  listOfInputTypeDefinition: InputTypeDefinition[],
): SearchableSelectorOption<InputType>[] => {
  return listOfInputTypeDefinition.map(inputTypeDefinition =>
    generateSearchableSelectorOption(inputTypeDefinition),
  );
};

export const UnionInput = (props: InputProps) => {
  const { label, onChange, typeDefinition, error, hasCollectionParent } = props;

  const { listOfSubTypes } = typeDefinition;

  if (!listOfSubTypes?.length) {
    return <></>;
  }

  const initialInputValue = getInitialInputValue(props);

  const initialInputTypeDefinition =
    initialInputValue?.typeDefinition ?? listOfSubTypes[0];

  if (!initialInputTypeDefinition) {
    return <></>;
  }

  const [inputTypeToValueMap, setInputTypeToValueMap] = useState<
    Record<InputType, UnionValue> | {}
  >(
    generateInputTypeToValueMap(
      listOfSubTypes,
      initialInputValue,
      initialInputTypeDefinition,
    ),
  );

  const [selectedInputType, setSelectedInputType] = useState<InputType>(
    initialInputTypeDefinition.type,
  );

  const inputTypeToInputTypeDefinition = listOfSubTypes?.reduce?.(
    (previous, current) => ({ ...previous, [current.type]: current }),
    {},
  );

  const selectedInputTypeDefinition = inputTypeToInputTypeDefinition[
    selectedInputType
  ] as InputTypeDefinition;

  // change the selected union input value when change the selected union input type
  useEffect(() => {
    if (inputTypeToValueMap[selectedInputType]) {
      handleSubTypeOnChange(inputTypeToValueMap[selectedInputType].value);
    }
  }, [selectedInputTypeDefinition]);

  const handleSubTypeOnChange = (input: InputValue) => {
    setInputTypeToValueMap({
      ...inputTypeToValueMap,
      [selectedInputType]: {
        value: input,
        typeDefinition: selectedInputTypeDefinition,
      } as UnionValue,
    });
  };

  const childComponentValue = useMemo(() => {
    return inputTypeToValueMap[selectedInputType];
  }, [inputTypeToValueMap, selectedInputType]);

  useEffect(() => {
    onChange(childComponentValue);
  }, [childComponentValue]);

  const inputComponent = getComponentForInput(
    {
      ...props,
      name: `${formatType(selectedInputTypeDefinition)}`,
      label: '',
      typeDefinition: selectedInputTypeDefinition,
      onChange: handleSubTypeOnChange,
      value: childComponentValue.value,
    } as InputProps,
    !hasCollectionParent,
  );

  return (
    <StyledCard error={error} label={label}>
      <SearchableSelector
        label={t('type')}
        options={generateListOfSearchableSelectorOptions(listOfSubTypes)}
        selectedItem={generateSearchableSelectorOption(
          selectedInputTypeDefinition,
        )}
        onSelectionChanged={(value: SearchableSelectorOption<InputType>) => {
          setSelectedInputType(value.data);
        }}
      />

      <div>{inputComponent}</div>
    </StyledCard>
  );
};
