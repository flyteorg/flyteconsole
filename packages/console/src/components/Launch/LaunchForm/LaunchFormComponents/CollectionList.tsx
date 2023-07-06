import React, { FC } from 'react';
import { Button, IconButton, styled } from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import { InputProps, InputValue } from '../types';
import { getComponentForInput } from './getComponentForInput';

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
  inputs: InputValue[];
  updateCollection: (inputs: InputValue[]) => void;
  defaultValue: InputValue;
  inputProps: InputProps;
}
/** Handles rendering of the input component for a Collection of SimpleType values */
export const CollectionList: FC<CollectionListProps> = props => {
  const { defaultValue, inputs, updateCollection, inputProps } = props;

  const onChange = (input: InputValue, index: number) => {
    const newinputs = [...inputs];
    newinputs[index] = input;
    updateCollection(newinputs);
  };

  const onAddItem = () => {
    updateCollection([...inputs, defaultValue]);
  };
  const onRemoveItem = (index: number) => {
    const newinputs = [...inputs];
    newinputs.splice(index, 1);
    updateCollection(newinputs);
  };

  return (
    <CollectionListContainer>
      {inputs?.map((inputValue, index) => (
        <div key={`component-${index}`} className="collectionItem">
          {getComponentForInput(
            {
              ...inputProps,
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
  );
};
