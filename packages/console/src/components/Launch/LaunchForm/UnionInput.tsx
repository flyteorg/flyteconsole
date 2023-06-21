import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {
  InputProps,
  InputType,
  InputTypeDefinition,
  UnionValue,
  InputValue,
} from './types';
import { formatType } from './utils';
import { getComponentForInput } from './LaunchFormInputs';
import { getHelperForInput } from './inputHelpers/getHelperForInput';
import {
  SearchableSelector,
  SearchableSelectorOption,
} from './SearchableSelector';
import t from '../../common/strings';

const StyledCard = styled(Card)(() => ({
  position: 'relative',
  overflow: 'visible',

  '& .inlineTitle': {
    position: 'absolute',
    top: '-8px',
    color: 'gray',
    background: 'white',
    fontSize: '10px',
  },
}));

const generateInputTypeToValueMap = (
  listOfSubTypes: InputTypeDefinition[] | undefined,
  initialInputValue: UnionValue | undefined,
  initialType: InputTypeDefinition,
): Record<InputType, UnionValue> | {} => {
  if (!listOfSubTypes?.length) {
    return {};
  }

  const final = listOfSubTypes.reduce(function (map, subType) {
    if (initialInputValue && subType === initialType) {
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
  const {
    initialValue,
    required,
    label,
    // onChange,
    typeDefinition,
    description,
    setIsError,
  } = props;

  const listOfSubTypes = typeDefinition?.listOfSubTypes;
  const [localSubtypeError, setLocalSubtypeError] = useState<string>();

  if (!listOfSubTypes?.length) {
    return <></>;
  }

  const inputTypeToInputTypeDefinition = listOfSubTypes.reduce(
    (previous, current) => ({ ...previous, [current.type]: current }),
    {},
  );

  const helper = getHelperForInput(typeDefinition.type);

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

  const selectedInputTypeDefintion = inputTypeToInputTypeDefinition[
    selectedInputType
  ] as InputTypeDefinition;

  // change the selected union input value when change the selected union input type
  useEffect(() => {
    if (inputTypeToValueMap[selectedInputType]) {
      handleSubTypeOnChange(inputTypeToValueMap[selectedInputType].value);
    }
  }, [selectedInputTypeDefintion]);

  const handleTypeOnSelectionChanged = (
    value: SearchableSelectorOption<InputType>,
  ) => {
    setSelectedInputType(value.data);
  };

  const handleSubTypeOnChange = (input: InputValue) => {
    const subtypeHelper = getHelperForInput(selectedInputTypeDefintion.type);
    const newValue = {
      value: input,
      typeDefinition: selectedInputTypeDefintion,
    };
    try {
      subtypeHelper.validate({
        ...newValue,
        required: props.required,
      } as any);
      setLocalSubtypeError('');
      setIsError(false);
    } catch (error) {
      setLocalSubtypeError(error.message);
      setIsError(true);
    }

    setInputTypeToValueMap({
      ...inputTypeToValueMap,
      [selectedInputType]: {
        value: input,
        typeDefinition: selectedInputTypeDefintion,
      } as UnionValue,
    });
  };

  const inputComponent = getComponentForInput(
    {
      description: description,
      name: `${formatType(selectedInputTypeDefintion)}`,
      label: '',
      required: required,
      typeDefinition: selectedInputTypeDefintion,
      onChange: handleSubTypeOnChange,
      value: inputTypeToValueMap[selectedInputType]?.value,
      error: localSubtypeError,
    } as InputProps,
    true,
    setIsError,
  );

  return (
    <StyledCard variant="outlined">
      <CardContent>
        <Typography variant="body1" component="label" className="inlineTitle">
          {label}
        </Typography>

        <SearchableSelector
          label={t('type')}
          options={generateListOfSearchableSelectorOptions(listOfSubTypes)}
          selectedItem={generateSearchableSelectorOption(
            selectedInputTypeDefintion,
          )}
          onSelectionChanged={handleTypeOnSelectionChanged}
        />

        <div>{inputComponent}</div>
      </CardContent>
    </StyledCard>
  );
};
