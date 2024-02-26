import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import Close from '@mui/icons-material/Close';
import { useEscapeKey } from '../hooks/useKeyListener';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),

  '.closeButton': {
    color: theme.palette.text.primary,
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

export interface ClosableDialogTitleProps {
  children: React.ReactNode;
  onClose: () => void;
}

/** A replacement for MUI's DialogTitle which also renders a close button */
export const ClosableDialogTitle: React.FC<ClosableDialogTitleProps> = ({ children, onClose }) => {
  // Close modal on escape key press
  useEscapeKey(onClose);

  return (
    <StyledDialogTitle>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="Close" className="closeButton" onClick={onClose} size="large">
          <Close />
        </IconButton>
      ) : null}
    </StyledDialogTitle>
  );
};
