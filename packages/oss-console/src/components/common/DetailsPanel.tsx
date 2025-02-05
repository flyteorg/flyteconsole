import React, { PropsWithChildren } from 'react';
import Drawer from '@mui/material/Drawer';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import styled from '@mui/system/styled';
import { detailsPanelId } from '@clients/common/constants';
import classnames from 'classnames';
import useResize from '@clients/oss-console/components/hooks/useResize';
import { defaultDetailsPanelWidth } from './constants';

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flex: '1 1 100%',
  maxHeight: '100%',
  paddingBottom: theme.spacing(2),
  pointerEvents: 'initial',
  '& .dragger': {
    width: '3px',
    cursor: 'ew-resize',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
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

  const { width, enableResize } = useResize({ minWidth: defaultDetailsPanelWidth });

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
      <StyledPaper id={detailsPanelId} square sx={{ width }}>
        <div onMouseDown={enableResize} className={classnames('dragger')} />
        {children}
      </StyledPaper>
    </Drawer>
  );
};
