import React from 'react';
import Button from '@mui/material/Button';
import styled from '@mui/system/styled';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import LockPerson from '@clients/ui-atoms/LockPerson';
import NotFoundError from '@clients/common/Errors/NotFoundError';
import NotAuthorizedError from '@clients/common/Errors/NotAuthorizedError';
import { NonIdealState } from '../common/NonIdealState';
import { PrettyError } from './PrettyError';

const StyledNonIdealState = styled(NonIdealState)(({ theme }) => ({
  margin: `${theme.spacing(2)} 0`,
}));

export interface DataErrorProps {
  errorTitle: string;
  error?: Error;
  retry?: () => void;
}

/** A shared error component to be used when data fails to load. */
export const DataError: React.FC<DataErrorProps> = ({ error, errorTitle, retry }) => {
  if (error instanceof NotFoundError) {
    return (
      <PrettyError
      // 404 is default config, so we don't need to pass it in.
      />
    );
  }
  // For NotAuthorized, we will be displaying a global error.
  if (error instanceof NotAuthorizedError) {
    return (
      <PrettyError
        title="Access Denied"
        description={
          !error?.message?.length ? 'You are not authorized to view this resource' : error.message
        }
        Icon={LockPerson}
      />
    );
  }

  const description = error ? error.message : undefined;

  const action = retry ? (
    <Button variant="contained" color="primary" onClick={retry}>
      Retry
    </Button>
  ) : undefined;
  return (
    <StyledNonIdealState
      className="container"
      description={description}
      title={errorTitle}
      icon={ErrorOutline}
    >
      {action}
    </StyledNonIdealState>
  );
};
