import React from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import classNames from 'classnames';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { PropertyGetter, SearchResult } from './useSearchableListState';

const StyledContainer = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  width: '100%',
}));

const StyledContainerMinimal = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
  minimalNotchedOutline: {
    borderRadius: 0,
  },
  minimalInput: {
    fontSize: CommonStylesConstants.bodyFontSize,
    padding: theme.spacing(1),
  },
}));

type SearchableListVariant = 'normal' | 'minimal';

/**
 * Show searchable text input field.
 * @param onClear
 * @param onSearchChange
 * @param placeholder
 * @param value
 * @param variant
 * @constructor
 */
export const SearchableInput: React.FC<{
  onClear: () => void;
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  variant: SearchableListVariant;
  value?: string;
  className?: string;
}> = ({ onClear, onSearchChange, placeholder, value, variant, className }) => {
  const startAdornment = (
    <InputAdornment position="start">
      <Search />
    </InputAdornment>
  );

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton aria-label="Clear search query" onClick={onClear} size="small">
        <Close />
      </IconButton>
    </InputAdornment>
  );

  const baseProps: TextFieldProps = {
    placeholder,
    value,
    autoFocus: true,
    dir: 'auto',
    fullWidth: true,
    inputProps: { role: 'search' },
    onChange: onSearchChange,
    variant: 'outlined',
    sx: {
      marginBottom: '16px',
    },
  };

  switch (variant) {
    case 'minimal':
      return (
        <StyledContainerMinimal>
          <TextField {...baseProps} margin="none" />
        </StyledContainerMinimal>
      );
    default: // 'normal'
      return (
        <StyledContainer className={classNames(className)}>
          <TextField {...baseProps} margin="dense" InputProps={{ endAdornment, startAdornment }} />
        </StyledContainer>
      );
  }
};

export type { SearchResult, PropertyGetter };
