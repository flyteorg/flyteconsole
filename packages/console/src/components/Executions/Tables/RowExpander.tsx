import * as React from 'react';
import { IconButton } from '@material-ui/core';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ExpandMore from '@material-ui/icons/ExpandMore';
import t from './strings';

interface RowExpanderProps {
  expanded: boolean;
  key?: string;
  onClick: () => void;
}
/** A simple expand/collapse arrow to be rendered next to row items. */
export const RowExpander = React.forwardRef<
  HTMLButtonElement,
  RowExpanderProps
>(({ expanded, key, onClick }, ref) => {
  return (
    <IconButton
      key={key}
      ref={ref}
      disableRipple={true}
      disableTouchRipple={true}
      size="small"
      title={t('expanderTitle', expanded)}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        // prevent the parent row body onClick event trigger
        e.stopPropagation();
        onClick();
      }}
    >
      {expanded ? <ExpandMore /> : <ChevronRight />}
    </IconButton>
  );
});
