import React, { useEffect } from 'react';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import styled from '@mui/system/styled';
import { FlyteLogo } from '../assets/icons/FlyteLogo';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: '448px',
    padding: '40px 64px',
    gap: '24px',
  },

  h2: {
    fontSize: '22px',
    lineHeight: '28px',
  },
  '& .MuiDialogTitle-root': {
    padding: 0,
  },

  '& .MuiDialogActions-root': {
    padding: 0,

    button: {
      width: '100%',
    },
  },

  '& .displayColumn': {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  '& .centerAlign': {
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

/** A shared panel rendered along the right side of the UI. Content can be
 * rendered into it using `LoginPanelContent`
 */
export const LoginPanel: React.FC<unknown> = () => {
  const { loginStatus, getLoginUrl } = useFlyteApi();
  const { expired } = loginStatus;
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  useEffect(() => {
    setIsLoginModalOpen(expired);
  }, [expired]);

  return (
    <StyledDialog
      open={isLoginModalOpen}
      onClose={() => {
        setIsLoginModalOpen(false);
      }}
      aria-labelledby="login-dialog-title"
      aria-describedby="login-dialog-description"
      PaperProps={{
        sx: {},
      }}
    >
      <DialogTitle id="login-dialog-title" className="centerAlign displayColumn">
        <FlyteLogo size={50} background="light" />
        Authorization Required
      </DialogTitle>
      <DialogActions className="centerAlign">
        <Box className="centerAlign displayColumn">
          <Button variant="contained" href={getLoginUrl()} autoFocus data-cy="login-button-overlay">
            Back to Sign in
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setIsLoginModalOpen(false);
            }}
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};
