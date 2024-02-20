import React, { ChangeEvent } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import { SearchableInput } from '../../common/SearchableList';

export const SearchBox = ({
  placeholder,
  showScheduled,
  onScheduleFilterChange,
  onClear,
  onSearchChange,
  searchString,
}: {
  showScheduled: boolean;
  placeholder: string;
  onScheduleFilterChange: (showScheduledItems: boolean) => void;
  onClear: () => void;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  searchString: string;
}) => {
  return (
    <FormGroup>
      <Box px={2}>
        <Grid container>
          <Grid
            item
            xs={12}
            sm="auto"
            sx={{
              display: 'flex',
              flexGrow: '1 !important',
            }}
          >
            <Box pt={1.25} width="100%">
              <SearchableInput
                onClear={onClear}
                onSearchChange={onSearchChange}
                placeholder={placeholder}
                value={searchString}
                variant="normal"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm="auto" alignSelf="center" justifySelf="flex-end">
            <Box pl={2} pb={{ xs: 2, sm: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showScheduled}
                    onChange={(_, checked) => onScheduleFilterChange(checked)}
                  />
                }
                label="Show Only Scheduled"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </FormGroup>
  );
};
