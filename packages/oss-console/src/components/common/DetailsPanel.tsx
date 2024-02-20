import React, { PropsWithChildren } from 'react';
import Drawer from '@mui/material/Drawer';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import styled from '@mui/system/styled';
import { detailsPanelId } from '@clients/common/constants';
import { detailsPanelWidth } from './constants';

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flex: '1 1 100%',
  maxHeight: '100%',
  paddingBottom: theme.spacing(2),
  pointerEvents: 'initial',
  width: detailsPanelWidth,
}));

interface DetailsPanelProps {
  onClose?: () => void;
  open?: boolean;
}

/** A shared panel rendered along the right side of the UI. Content can be
 * rendered into it using `DetailsPanelContent`
 */
export const DetailsPanel: React.FC<PropsWithChildren<DetailsPanelProps>> = ({
  children,
  onClose,
  open = false,
}) => {
  const theme = useTheme();
  return (
    <Drawer
      anchor="right"
      data-testid={detailsPanelId}
      ModalProps={{
        hideBackdrop: true,
        // This is needed to prevent the modal from stealing focus
        // from other modals in the app
        disableEnforceFocus: true,
        sx: {
          pointerEvents: 'none',
          padding: '100px',
          // Modal uses inline styling for the zIndex, so we have to
          // override it
          zIndex: theme.zIndex.appBar - 2,
        },
      }}
      onClose={onClose}
      open={open}
      key="detailsPanel"
    >
      <StyledPaper id={detailsPanelId} square>
        {children}
      </StyledPaper>
    </Drawer>
  );
};
