/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import NotFoundError from '@clients/common/Errors/NotFoundError';
import { log } from '../../common/log';
import { useCommonStyles } from './styles';
import { PrettyError } from '../Errors/PrettyError';
import { NonIdealState } from './NonIdealState';

interface ErrorBoundaryState {
  error?: Error;
}

const RenderError: React.FC<{ error: Error; fixed: boolean }> = ({
  error,
  // @ts-ignore eslint-disable-next-line also a eslint unused-vars at top of file
  fixed,
}) => {
  const commonStyles = useCommonStyles();
  const description = (
    <Box>
      <Typography variant="body1">The error we received was:</Typography>
      <Card elevation={8} sx={{ mt: 1, mb: 2 }}>
        <CardContent className={commonStyles.codeBlock}>{`${error}`}</CardContent>
      </Card>
      <Typography variant="body1">
        <small>There may be additional information in the browser console.</small>
      </Typography>
    </Box>
  );
  return <NonIdealState icon={ErrorOutline} title="Unexpected error" description={description} />;
};

/** A generic error boundary which will render a NonIdealState and display
 * whatever error was thrown. `fixed` controls whether the container is
 * rendered with fixed positioning and filled to the edges of the window.
 */
export class ErrorBoundary extends React.Component<
  PropsWithChildren<{ fixed?: boolean }>,
  ErrorBoundaryState
> {
  constructor(props: object) {
    super(props);
    this.state = { error: undefined };
  }

  // @ts-ignore legacy
  componentDidCatch(error: Error, info: unknown) {
    this.setState({ error });
    log.error(error, info);
  }

  // @ts-ignore legacy
  render() {
    const { fixed = false } = this.props;
    if (this.state.error) {
      if (this.state.error instanceof NotFoundError) {
        return <PrettyError />;
      }

      return <RenderError error={this.state.error} fixed={fixed} />;
    }
    return this.props.children;
  }
}
