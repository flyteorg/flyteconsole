import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import t from './strings';

interface RowExpanderProps {
  isLoading?: boolean;
  expanded: boolean;
  disabled?: boolean;
  key?: string;
  onClick: () => void;
}
/** A simple expand/collapse arrow to be rendered next to row items. */
export const RowExpander = React.forwardRef<HTMLButtonElement, RowExpanderProps>(
  ({ disabled, expanded, isLoading, key, onClick }, ref) => {
    return isLoading ? (
      <Box
        sx={{
          minWidth: '34px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <LoadingSpinner size="small" color="info" />
      </Box>
    ) : (
      <IconButton
        key={key}
        ref={ref}
        disableRipple
        disableTouchRipple
        size="small"
        title={t('expanderTitle', expanded)}
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          // prevent the parent row body onClick event trigger
          e.stopPropagation();
          onClick();
        }}
        disabled={disabled}
      >
        {expanded ? <ExpandMore /> : <ChevronRight />}
      </IconButton>
    );
  },
);
