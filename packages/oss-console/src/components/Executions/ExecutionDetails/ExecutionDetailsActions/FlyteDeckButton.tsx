import React, { FC, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Close from '@mui/icons-material/Close';
import Fullscreen from '@mui/icons-material/Fullscreen';
import FullscreenExit from '@mui/icons-material/FullscreenExit';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import t from '../strings';
import { WorkflowNodeExecution } from '../../contexts';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { useEscapeKey } from '../../../hooks/useKeyListener';
import { ExecutionNodeDeck } from '../ExecutionNodeDeck';

const fullscreenDialog = {
  maxWidth: '100vw',
  width: '100vw',
  maxHeight: '100svh',
  height: '100svh',
  margin: 0,
  transition: 'all 0.3s ease',
  borderRadius: 0,
};

const dialog = {
  maxWidth: `calc(100% - 96px)`,
  maxHeight: `calc(100% - 96px)`,
  height: '720px',
  width: '880px',
  transition: 'all 0.3s ease',
};

export interface FlyteDeckButtonProps {
  nodeExecution: WorkflowNodeExecution;
  phase: NodeExecutionPhase;
  flyteDeckText?: string;
}
export const FlyteDeckButton: FC<FlyteDeckButtonProps> = ({
  nodeExecution,
  phase,
  flyteDeckText,
}) => {
  const [showDeck, setShowDeck] = useState(false);
  const [fullScreen, setSetFullScreen] = useState(false);
  const onCloseDeck = () => setShowDeck(false);
  // Close deck modal on escape key press
  useEscapeKey(onCloseDeck);

  const toggleFullScreen = () => {
    setSetFullScreen(!fullScreen);
  };

  return nodeExecution?.closure?.deckUri ? (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setShowDeck(true)}
      >
        {flyteDeckText || t('flyteDeck')}
      </Button>
      <Dialog
        PaperProps={{
          sx: fullScreen ? fullscreenDialog : dialog,
        }}
        maxWidth={false}
        open={showDeck}
      >
        <Grid
          container
          justifyContent="space-between"
          alignContent="center"
          sx={{
            padding: '16px 16px 0 16px',
          }}
        >
          <Grid item>
            <IconButton aria-label="Expand" onClick={toggleFullScreen} size="large">
              {fullScreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Grid>
          <Grid item>
            <Typography
              variant="h2"
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                fontSize: '24px',
                lineHeight: '32px',
                marginBlock: 0,
              }}
              py={2}
            >
              {t('flyteDeck')}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton aria-label="close" onClick={onCloseDeck} size="large">
              <Close />
            </IconButton>
          </Grid>
        </Grid>
        <DialogContent
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <ExecutionNodeDeck nodeExecutionId={nodeExecution.id} />
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <></>
  );
};
