import React from 'react';
import Box from '@mui/material/Box';
import { tooltipClasses } from '@mui/material/Tooltip';
import styled from '@mui/system/styled';
import classNames from 'classnames';
import { useCommonStyles } from '@clients/theme/CommonStyles/CommonStyles';

interface HoverTooltipProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  noTruncate?: boolean;
}

const TooltipWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex !important',
  '& .tooltip': {
    opacity: 0,
    transition: 'opacity 0.2s ease',
    position: 'absolute',
    zIndex: 99999,
    left: `calc(100% + ${theme.spacing(1)})`,
    top: 0,
    marginTop: '-0.25rem',
    maxWidth: theme.spacing(30),
    textWrap: 'wrap',
    linebreak: 'auto',
  },
  '&:hover': {
    cursor: 'pointer',
    overflow: 'visible !important',
    '& .tooltip': {
      opacity: 1,
    },
  },
})) as typeof Box;

const TooltipContent = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  maxWidth: '300px',
  marginLeft: '2px',
  wordWrap: 'break-word',
  fontWeight: 500,
  ...((theme.components?.MuiTooltip?.styleOverrides?.tooltip ?? {}) as object),
})) as typeof Box;

/**
 * This only Uses CSS. No JS. No Popper.js portal.
 *
 * A tooltip that appears when the user hovers over the wrapped element.
 *
 * Appropriate for when there are multiple tooltips on the page where the
 * DOM hitboxes may overlap due to timing issues with the onmouseleave event.
 */
export const HoverTooltip = ({ children, title, noTruncate }: HoverTooltipProps) => {
  const commonStyles = useCommonStyles();
  return (
    <TooltipWrapper component="span">
      <Box className={!noTruncate ? commonStyles.truncateText : ''}>{children}</Box>
      <TooltipContent
        role="tooltip"
        className={classNames(
          'tooltip',
          tooltipClasses.tooltip,
          tooltipClasses.tooltipPlacementRight,
        )}
      >
        {title}
      </TooltipContent>
    </TooltipWrapper>
  );
};
