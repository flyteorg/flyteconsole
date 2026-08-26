import Dialog from '@mui/material/Dialog';
import styled from '@mui/system/styled';

/** Shared shell for the session dialogs (login expired, sign out): centered Flyte
 * logo, a title, and full-width stacked actions. */
export const SessionDialog = styled(Dialog)(() => ({
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

export default SessionDialog;
