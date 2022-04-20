import { Button, Popover } from '@material-ui/core';
import { fade, makeStyles, Theme } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import ExpandMore from '@material-ui/icons/ExpandMore';
import classnames from 'classnames';
import {
  buttonHoverColor,
  interactiveTextBackgroundColor,
  interactiveTextColor,
} from 'components/Theme/constants';
import * as React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  const horizontalButtonPadding = theme.spacing(1.5);
  return {
    container: {
      display: 'flex',
      flex: '1 1 auto',
    },
    buttonIcon: {
      marginLeft: theme.spacing(1),
      marginRight: -horizontalButtonPadding / 2,
    },
    resetIcon: {
      cursor: 'pointer',
      '&:hover': {
        color: fade(interactiveTextColor, 0.4),
      },
    },
    popoverContent: {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 4,
      marginTop: theme.spacing(0.25),
      padding: `${theme.spacing(2)}px ${theme.spacing(1.5)}px`,
    },
  };
});

export interface FilterPopoverButtonProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  open: boolean;
  renderContent: () => JSX.Element;
  children: JSX.Element[] | JSX.Element;
}

/** Renders a common filter button with shared behavior for active/hover states,
 * a reset icon, and rendering the provided content in a `Popover`. The state
 * for this button can be mostly generated using the `useFilterButtonState` hook,
 * but will generally be included as part of a bigger filter state such as
 * `SingleSelectFilterState`.
 */
export const FilterPopoverIcon: React.FC<FilterPopoverButtonProps> = ({
  className,
  onClick,
  open,
  renderContent,
  children,
}) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const styles = useStyles();

  return (
    <div className={className}>
      <div className={styles.container} ref={divRef}>
        {children}
      </div>
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        anchorEl={divRef.current}
        elevation={1}
        onClose={onClick}
        open={open}
        PaperProps={{ className: styles.popoverContent }}
      >
        {renderContent()}
      </Popover>
    </div>
  );
};
