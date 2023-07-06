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
      map[subType.type] = { value: undefined, typeDefinition: subType };
    }
    return map;
  }, {});
  return final;
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
  const { initialValue, label, onChange, typeDefinition, error } = props;

  const { listOfSubTypes, type } = typeDefinition;

  if (!listOfSubTypes?.length) {
    return <></>;
  }

  const helper = getHelperForInput(type);

  const initialInputValue =
    initialValue &&
    (helper.fromLiteral(initialValue, typeDefinition) as UnionValue);

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
    return inputTypeToValueMap[selectedInputType]?.value;
  }, [inputTypeToValueMap, selectedInputType]);

  useEffect(() => {
    const newValue = {
      value: childComponentValue,
      typeDefinition: selectedInputTypeDefinition,
    } as any;
    onChange(newValue);
  }, [childComponentValue]);

  const inputComponent = getComponentForInput(
    {
      ...props,
      name: `${formatType(selectedInputTypeDefinition)}`,
      label: '',
      typeDefinition: selectedInputTypeDefinition,
      onChange: handleSubTypeOnChange,
      value: childComponentValue,
    } as InputProps,
    true,
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
