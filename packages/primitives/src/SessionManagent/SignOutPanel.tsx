import React from 'react';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { FlyteLogo } from '../assets/icons/FlyteLogo';
import { SessionDialog } from './SessionDialog';
import t from './strings';

export interface SignOutPanelProps {
  open: boolean;
  onCancel: () => void;
}

/** Confirmation shown before signing out. Signing out ends the Admin session, so
 * it is worth a deliberate click rather than firing on the menu item itself. */
export const SignOutPanel: React.FC<SignOutPanelProps> = ({ open, onCancel }) => {
  const { getLogoutUrl } = useFlyteApi();

  return (
    <SessionDialog
      open={open}
      onClose={onCancel}
      aria-labelledby="signout-dialog-title"
      data-cy="signout-dialog"
    >
      <DialogTitle id="signout-dialog-title" className="centerAlign displayColumn">
        <FlyteLogo size={50} background="light" />
        {t('signOutTitle')}
      </DialogTitle>
      <DialogActions className="centerAlign">
        <Box className="centerAlign displayColumn">
          <Button variant="contained" href={getLogoutUrl()} autoFocus data-cy="signout-confirm">
            {t('signOutConfirm')}
          </Button>
          <Button variant="outlined" onClick={onCancel} data-cy="signout-cancel">
            {t('signOutCancel')}
          </Button>
        </Box>
      </DialogActions>
    </SessionDialog>
  );
};
