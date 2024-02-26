import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import styled from '@mui/system/styled';

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
})) as typeof FormLabel;

export interface SearchInputFormProps {
  label: string;
  placeholder?: string;
  onChange: (newValue: string) => void;
  defaultValue: string;
}

/** Form content for rendering a header and search input. The value is applied
 * on submission of the form.
 */
export const SearchInputForm: React.FC<SearchInputFormProps> = ({
  label,
  placeholder,
  onChange,
  defaultValue,
}) => {
  const [value, setValue] = React.useState(defaultValue);
  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = ({ target: { value } }) =>
    setValue(value);

  const onSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    onChange(value);
  };
  return (
    <form onSubmit={onSubmit}>
      <StyledFormLabel component="legend">{label}</StyledFormLabel>
      <FormControl margin="dense" variant="outlined" fullWidth>
        <Box margin={[1, 0]}>
          <OutlinedInput
            autoFocus
            // MIGRATION_TODO: labelWidth={0}
            onChange={onInputChange}
            placeholder={placeholder}
            type="text"
            value={value}
          />
        </Box>
      </FormControl>
      <Button color="primary" onClick={onSubmit} type="submit" variant="contained">
        Find
      </Button>
    </form>
  );
};
