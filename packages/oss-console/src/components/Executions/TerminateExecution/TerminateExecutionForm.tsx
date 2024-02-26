import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import CircularProgressButton from '@clients/primitives/CircularProgressButton';
import { useCommonStyles } from '../../common/styles';
import { useTerminateExecutionState } from './useTerminateExecutionState';

const StyledHtmlForm = styled('form')(({ theme }) => ({
  width: theme.spacing(30),
  padding: theme.spacing(2),

  '.buttonGroup': {
    justifyContent: 'center',
  },
  '.input': {
    fontSize: CommonStylesConstants.smallFontSize,
  },
  title: {
    marginBottom: theme.spacing(1),
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },
}));

// This corresponds to the maximum length allowed by the API.
const defaultCauseString = 'Terminated from UI';
const placeholderString = 'Reason for termination (optional)';

/** A small form for creating and submitting a request to terminate a workflow
 * execution. This includes error/retry logic in the case of an API failure.
 */
export const TerminateExecutionForm: React.FC<{
  onClose: (...args: any) => void;
}> = ({ onClose }) => {
  const commonStyles = useCommonStyles();
  const {
    cause,
    setCause,
    terminationState: { error, isLoading: terminating },
    terminateExecution,
  } = useTerminateExecutionState(onClose);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = ({ target: { value } }) =>
    setCause(value);

  const submit: React.FormEventHandler = (event) => {
    event.preventDefault();
    terminateExecution(cause || defaultCauseString);
  };

  return (
    <StyledHtmlForm>
      <FormLabel component="legend" className="title">
        Terminate Workflow
      </FormLabel>
      <FormControl margin="dense" variant="outlined" fullWidth>
        <OutlinedInput
          autoFocus
          className="input"
          fullWidth
          // MIGRATION_TODO
          // labelWidth={0}
          multiline
          onChange={onChange}
          placeholder={placeholderString}
          maxRows={4}
          minRows={4}
          type="text"
          value={cause}
        />
      </FormControl>
      {error && <p className={commonStyles.errorText}>{`${error}`}</p>}
      <div className={commonStyles.formButtonGroup}>
        <Button
          color="primary"
          disabled={terminating}
          onClick={submit}
          type="submit"
          variant="contained"
        >
          Terminate
          {terminating && <CircularProgressButton />}
        </Button>
        <Button
          color="primary"
          disabled={terminating}
          id="terminate-execution-cancel"
          onClick={onClose}
          variant="outlined"
        >
          Cancel
        </Button>
      </div>
    </StyledHtmlForm>
  );
};
