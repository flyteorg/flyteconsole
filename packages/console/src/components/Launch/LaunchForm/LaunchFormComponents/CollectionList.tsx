import React, { FC, useMemo } from 'react';
import { IconButton, styled } from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import { InputProps, InputType, InputValue } from '../types';
import { getComponentForInput } from './getComponentForInput';
import { isSimpleType } from './SimpleInput';
import { parseCollection } from '../inputHelpers/collection';

export const CollectionListContainer = styled('div')(({ theme }) => ({
  position: 'relative',

  '& .collectionItem': {
    position: 'relative',
    width: '95%',
    '& .delete-icon': {
      position: 'absolute',
      zIndex: 1,
      color: theme.palette.error.light,
      top: '50%',
      right: '-38px',
    },
  },

  '& .add-icon': {
    position: 'absolute',
    zIndex: 1,
    right: '-12px',
    bottom: '-35px',
  },
}));

export interface CollectionListProps {
  updateCollection: (inputs: InputValue[]) => void;
  defaultValue: InputValue;
  inputProps: InputProps;
}
/** Handles rendering of the input component for a Collection of SimpleType values */
export const CollectionList: FC<CollectionListProps> = props => {
  const { defaultValue, updateCollection, inputProps } = props;
  const { value, typeDefinition, initialValue } = inputProps;

  const collectionInputs = value as InputValue[];

  const { isTextSubType } = useMemo(() => {
    const { type, listOfSubTypes } = typeDefinition;

    const isTextSubType =
      isSimpleType(type!) ||
      (type === InputType.Union &&
        listOfSubTypes?.some(st => isSimpleType(st.type)));

    return { isTextSubType };
  }, [typeDefinition]);

  const onChange = (input: InputValue, index: number) => {
    const newinputs = [...collectionInputs];
    newinputs[index] = input;
    updateCollection(newinputs);
  };

  const onAddItem = () => {
    updateCollection([...collectionInputs, defaultValue]);
  };
  const onRemoveItem = (index: number) => {
    const newinputs = [...collectionInputs];
    newinputs.splice(index, 1);
    updateCollection(newinputs);
  };

  return !isTextSubType ? (
    <CollectionListContainer>
      {collectionInputs?.map((inputValue, index) => (
        <div key={`component-${index}`} className="collectionItem">
          {getComponentForInput(
            {
              ...inputProps,
              initialValue: initialValue?.[index],
              value: inputValue,
              label: `${inputProps.description}[${index}]`,
              onChange: val => onChange(val, index),
            },
            // do not show errors for collection items
            false,
          )}
          <IconButton
            onClick={() => onRemoveItem(index)}
            className="delete-icon"
            size="small"
            title="Remove"
          >
            <RemoveIcon color="secondary" />
          </IconButton>
        </div>
      ))}
      <IconButton
        onClick={onAddItem}
        className="add-icon"
        size="small"
        title="Add"
      >
        <AddIcon color="primary" />
      </IconButton>
    </CollectionListContainer>
  ) : (
    getComponentForInput(
      {
        ...inputProps,
        // value: inputValue,
        label: '',
        onChange: inputValue => {
          if ((inputValue as any)?.typeDefinition?.type === InputType.None) {
            updateCollection([inputValue]);
          } else {
            let newValue = (inputValue as any)?.value;
            try {
              newValue = (parseCollection(newValue) as string[])?.map(
                (v: any) =>
                  ({
                    value: v,
                    typeDefinition: (inputValue as any).typeDefinition,
                  } as InputValue),
              );
              updateCollection(newValue);
            } catch {
              // do nothing
              updateCollection(inputValue as any);
            }
          }
        },
      },
      // do not show errors for collection items
      false,
    )
  );
};
