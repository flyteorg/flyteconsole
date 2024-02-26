import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import styled from '@mui/system/styled';
import { useCommonStyles } from './styles';

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  lineHeight: 1.5,
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
})) as typeof FormLabel;

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export interface SelectValue {
  label: string;
  value: string;
  data: any;
}

export interface SingleSelectFormProps {
  label: string;
  onChange: (newValue: string) => void;
  values: SelectValue[];
  selectedValue: string;
}

/** Form content for rendering a header and list of radios. */
export const SingleSelectForm: React.FC<SingleSelectFormProps> = ({
  label,
  onChange,
  values,
  selectedValue,
}) => {
  const commonStyles = useCommonStyles();
  const handleChange = (_e: React.ChangeEvent<{}>, value: string) => {
    onChange(value);
  };

  return (
    <div>
      <FormControl component="fieldset">
        <StyledFormLabel component="legend">{label}</StyledFormLabel>
        <StyledRadioGroup
          aria-label={label}
          name={label}
          value={selectedValue}
          onChange={handleChange}
        >
          {values.map(({ label, value }) => (
            <FormControlLabel
              className={commonStyles.formControlLabelSmall}
              key={label}
              value={value}
              control={<Radio className={commonStyles.formControlSmall} size="small" />}
              label={label}
            />
          ))}
        </StyledRadioGroup>
      </FormControl>
    </div>
  );
};
