import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useMutation } from 'react-query';
import { useEscapeKey } from '../../hooks/useKeyListener';
import { LaunchPlan, LaunchPlanState } from '../../../models/Launch/types';
import { updateLaunchPlan } from '../../../models/Launch/api';

interface DeactivateScheduleModalProps {
  activeLaunchPlan: LaunchPlan;
  open: boolean;
  onClose(): void;
  refetch(): void;
}

/** Renders a Modal that will load/display the inputs/outputs for a given
 * Execution in a tabbed/scrollable container
 */
export const DeactivateScheduleModal: React.FC<DeactivateScheduleModalProps> = ({
  activeLaunchPlan,
  open,
  onClose,
  refetch,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  useEscapeKey(onClose);

  const mutation = useMutation(
    (newState: LaunchPlanState) => updateLaunchPlan(activeLaunchPlan?.id, newState),
    {
      onMutate: () => setIsUpdating(true),
      onSuccess: () => {
        refetch();
        setIsUpdating(false);
        onClose();
      },
      onError: (_data) => {
        // TODO: handle error
      },
      onSettled: (_data) => {
        setIsUpdating(false);
      },
    },
  );

  const onClick = (_event: any) => {
    mutation.mutate(LaunchPlanState.INACTIVE);
  };
  return (
    <Dialog maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Deactivate launch plan</DialogTitle>
      <DialogContent>
        <DialogContentText>Any future events will not run</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onClick} autoFocus disabled={isUpdating}>
          Deactivate
        </Button>
      </DialogActions>
    </Dialog>
  );
};
