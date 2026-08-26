import React, { useEffect } from 'react';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { FlyteLogo } from '../assets/icons/FlyteLogo';
import { SessionDialog } from './SessionDialog';

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
    <SessionDialog
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
    </SessionDialog>
  );
};
