import React, { forwardRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import copyToClipboard from 'copy-to-clipboard';
import { errorBackgroundColor } from '@clients/theme/CommonStyles/constants';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { RowExpander } from '../Tables/RowExpander';
import { ScrollableMonospaceText } from '../../common/ScrollableMonospaceText';
import { env } from '@clients/common/environment';

const StyledScrollableMonospaceText = styled(ScrollableMonospaceText)(({ theme }) => ({
  '&>div': {
    padding: '0 !important',
    overflow: 'auto !important',
  },
  '& button': {
    right: '8px !important',
  },
}));

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeURL: React.FC<{
  dataSourceURI?: string;
  copyUrlText: string;
}> = ({ dataSourceURI, copyUrlText }) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const isHttps = /^https:/.test(window.location.href);
  const ref = React.useRef<HTMLDivElement>(null);

  const config =
    env.CODE_SNIPPET_USE_AUTO_CONFIG === "true"
      ? 'Config.auto()'
      : isHttps
      ? // https snippet
        `Config.for_endpoint("${window.location.host}")`
      : // http snippet
        `Config.for_endpoint("${window.location.host}", True)`;
    const code = `from flytekit.remote.remote import FlyteRemote
from flytekit.configuration import Config
remote = FlyteRemote(
    ${config},
)
remote.get("${dataSourceURI}")`;

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return dataSourceURI ? (
    <Grid
      direction="column"
      sx={{
        margin: (theme) => theme.spacing(1, 0, 1, 1),
      }}
    >
      <Grid>
        <Button
          variant="text"
          color="primary"
          size="small"
          LinkComponent={forwardRef((props, ref) => (
            <Link href={props.href} ref={ref} {...props} />
          ))}
          endIcon={
            <FileCopyIcon
              sx={{
                fontSize: '14px !important',
              }}
            />
          }
          onClick={(event) => {
            event.preventDefault();

            copyToClipboard(dataSourceURI);
          }}
        >
          <Typography variant="body1">{copyUrlText}</Typography>
        </Button>
      </Grid>

      <Grid
        container
        sx={{
          alignItems: 'center',
        }}
      >
        <RowExpander expanded={expanded} onClick={toggleExpanded} />
        <Typography variant="body2">FlyteRemote Usage</Typography>
      </Grid>

      <Grid
        sx={{
          display: expanded ? 'block' : 'none',
          marginLeft: '16px',
        }}
      >
        <StyledScrollableMonospaceText
          ref={ref}
          text={code}
          content={
            <SyntaxHighlighter
              language="python"
              style={prism}
              customStyle={{
                fontSize: '12px', // Adjust the font size as desired
                backgroundColor: errorBackgroundColor,
                margin: 0,
              }}
            >
              {code}
            </SyntaxHighlighter>
          }
        />
      </Grid>
    </Grid>
  ) : null;
};
