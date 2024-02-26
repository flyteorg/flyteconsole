import React from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/system/colorManipulator';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import classnames from 'classnames';
import useTheme from '@mui/system/useTheme';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';

const StyledContainer = styled('div')(({ theme }) => {
  const buttonInteractiveStyles = {
    borderColor: theme.palette.text.primary,
    color: theme.palette.text.primary,
  };
  const horizontalButtonPadding = theme.spacing(0.75);
  return {
    '.button': {
      border: `0.5px solid ${theme.palette.common.grays[30]}`,
      color: theme.palette.common.grays[40],

      marginRight: theme.spacing(1),
      '&.active, &.active:hover, &.active.open': {
        backgroundColor: theme.palette.primary.dark,
        borderColor: 'transparent',
        color: theme.palette.primary.contrastText,
      },
      '&:hover': {
        ...buttonInteractiveStyles,
        backgroundColor: CommonStylesConstants.buttonHoverColor,
      },
      '&.open': buttonInteractiveStyles,
    },
    '.buttonIcon': {
      marginLeft: theme.spacing(1),
      marginRight: -horizontalButtonPadding / 2,
    },
    '.resetIcon': {
      cursor: 'pointer',
      '&:hover': {
        color: alpha(CommonStylesConstants.interactiveTextColor, 0.4),
      },
    },
  };
});

export interface FilterPopoverButtonProps {
  active?: boolean;
  buttonText: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onReset?: () => void;
  open: boolean;
  renderContent: () => JSX.Element;
}

/** Renders a common filter button with shared behavior for active/hover states,
 * a reset icon, and rendering the provided content in a `Popover`. The state
 * for this button can be mostly generated using the `useFilterButtonState` hook,
 * but will generally be included as part of a bigger filter state such as
 * `SingleSelectFilterState`.
 */
export const FilterPopoverButton: React.FC<FilterPopoverButtonProps> = ({
  active,
  buttonText,
  className,
  onClick,
  onReset,
  open,
  renderContent,
}) => {
  const theme = useTheme();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  let iconContent: JSX.Element;

  if (active && onReset) {
    const onClickReset = (event: React.MouseEvent) => {
      event.stopPropagation();
      onReset();
    };
    iconContent = (
      <Close
        className={classnames('buttonIcon', 'resetIcon')}
        fontSize="inherit"
        onClick={onClickReset}
      />
    );
  } else {
    iconContent = <ExpandMore className="buttonIcon" fontSize="inherit" />;
  }

  return (
    <StyledContainer className={className}>
      <Button
        disableRipple
        disableTouchRipple
        className={classnames('button', { active, open })}
        ref={buttonRef}
        size="small"
        onClick={onClick}
        variant="outlined"
      >
        {buttonText}
        {iconContent}
      </Button>
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        anchorEl={buttonRef.current}
        elevation={1}
        onClose={onClick}
        open={open}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              marginTop: theme.spacing(0.25),
              padding: `${theme.spacing(2)} ${theme.spacing(1.5)}`,
            },
          },
        }}
      >
        {renderContent()}
      </Popover>
    </StyledContainer>
  );
};
