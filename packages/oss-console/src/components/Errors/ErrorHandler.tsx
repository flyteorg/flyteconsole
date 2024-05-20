import NotAuthorizedError from '@clients/common/Errors/NotAuthorizedError';
import NotFoundError from '@clients/common/Errors/NotFoundError';
import { AxiosError } from 'axios';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import { GenericError } from './GenericError';

export interface ErrorHandlerProps {
  error: NotFoundError | NotAuthorizedError | AxiosError | Error;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error }) => {
  const { getLoginUrl } = useFlyteApi();

  const contactSupport = (
    <>
      <Typography variant="label">
        Please join the Slack community and explore its history on{' '}
        <Link
          color="inherit"
          variant="label"
          sx={{
            fontSize: 'inherit',
          }}
          href="https://discuss.flyte.org/"
          target="_blank"
        >
          discuss.flyte.org
        </Link>
        {', '}
        or file a GitHub issue on{' '}
        <Link
          color="inherit"
          variant="label"
          sx={{
            fontSize: 'inherit',
          }}
          href="https://github.com/flyteorg/flyte"
          target="_blank"
        >
          flyteorg/flyte
        </Link>{' '}
        if the problem persists.
      </Typography>
    </>
  );

  if (
    error instanceof NotFoundError ||
    (error instanceof AxiosError && error.response?.status === 404)
  ) {
    return (
      <GenericError
        title="404"
        description="Not Found"
        content={
          <>
            <Box py={1} />
            <Typography variant="body2">The requested resource was not found</Typography>

            <Box py={1} />

            {contactSupport}
          </>
        }
      />
    );
  }

  if (
    error instanceof NotAuthorizedError ||
    (error instanceof AxiosError && error.response?.status === 401)
  ) {
    return (
      <GenericError
        title="401"
        description="Unauthorized"
        content={
          <>
            <Box py={1} />
            <Typography variant="body2">
              <strong>You do not have the proper authentication to access this page</strong>
            </Typography>

            <Box py={1} />

            {contactSupport}
            <Box py={1} />

            <Button
              variant="contained"
              href={getLoginUrl()}
              autoFocus
              data-cy="login-button-overlay"
            >
              Log in
            </Button>
          </>
        }
      />
    );
  }

  if (error instanceof AxiosError && error.response?.status === 403) {
    return (
      <GenericError
        title="403"
        description="Forbidden"
        content={
          <>
            <Box py={1} />
            <Typography variant="body2">
              <strong>You don't have permission to access this page</strong>
            </Typography>

            <Box py={1} />

            {contactSupport}
          </>
        }
      />
    );
  }

  return (
    <GenericError
      title={(error as AxiosError)?.response?.status || 'Oops!'}
      description="Something went wrong."
      content={
        <>
          <Box py={1} />

          {contactSupport}
        </>
      }
    />
  );
};
