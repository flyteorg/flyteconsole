import * as React from 'react';
import { Box, Button, SvgIconTypeMap, Typography } from '@material-ui/core';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { DefaultComponentProps } from '@material-ui/core/OverridableComponent';
import copyToClipboard from 'copy-to-clipboard';
import { Theme, makeStyles } from '@material-ui/core/styles';
import { Core } from '@flyteorg/flyteidl-types';
import {
  primaryHighlightColor,
  separatorColor,
  errorBackgroundColor,
  listhoverColor,
} from 'components/Theme/constants';
import classNames from 'classnames';
import { RowExpander } from '../Tables/RowExpander';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginLeft: '-10px',
  },
  codeWrapper: {
    overflow: 'hidden',
    border: `1px solid ${separatorColor}`,
    borderRadius: 4,
    marginLeft: '16px',
  },

  hoverWrapper: {
    position: 'relative',

    '& .textButton': {
      color: theme.palette.primary.main,
      border: 'none',
      right: '2px',
      top: 0,
    },

    '& .copyButton': {
      backgroundColor: theme.palette.common.white,
      border: `1px solid ${primaryHighlightColor}`,
      borderRadius: theme.spacing(1),
      color: theme.palette.text.secondary,
      height: theme.spacing(4),
      minWidth: 0,
      padding: 0,
      position: 'absolute',
      right: theme.spacing(2),
      top: theme.spacing(1),
      width: theme.spacing(4),
      display: 'none',

      '&:hover': {
        backgroundColor: listhoverColor,
      },
    },
    '&:hover': {
      '& .copyButton': {
        display: 'flex',
      },
    },

    '& pre': {
      margin: '0 !important',
    },
  },
}));

const CopyButton: React.FC<
  DefaultComponentProps<SvgIconTypeMap<{}, 'svg'>> & {
    onCopyClick: React.MouseEventHandler<HTMLButtonElement>;
    buttonVariant?: 'text' | 'button';
  }
> = ({ onCopyClick, buttonVariant, children, ...props }) => {
  return (
    <Button
      // variant={buttonVariant === 'text' ? 'text' : 'outlined'}
      color="primary"
      className={buttonVariant === 'text' ? 'textButton' : 'copyButton'}
      onClick={onCopyClick}
    >
      {children ? children : null}
      <FileCopyIcon {...props} />
    </Button>
  );
};

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeURL: React.FC<{
  nodeExecutionId: Core.NodeExecutionIdentifier;
  dataSourceURI: string;
  copyUrlText: string;
}> = ({ nodeExecutionId, dataSourceURI, copyUrlText }) => {
  const styles = useStyles();
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const project = nodeExecutionId.executionId?.project;
  const domain = nodeExecutionId.executionId?.domain;

  const code = `from flytekit.remote.remote import FlyteRemote
from flytekit.configuration import Config
remote = FlyteRemote(
    Config.for_endpoint(endpoint="${window.location.host}"),
    default_project="${project}",
    default_domain="${domain}"
)
remote.get("${dataSourceURI}")`;

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box
      className={styles.container}
      sx={{
        marginBottom: '20px',
      }}
    >
      <Box className={styles.hoverWrapper}>
        <CopyButton
          buttonVariant="text"
          style={{
            fontSize: '14px',
          }}
          onCopyClick={event => {
            event.preventDefault();

            copyToClipboard(dataSourceURI);
          }}
        >
          <Typography
            variant="body1"
            style={{
              paddingRight: '5px',
            }}
          >
            {copyUrlText}
          </Typography>
        </CopyButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          alignItems: 'center',
        }}
      >
        <RowExpander expanded={expanded} onClick={toggleExpanded} />
        <Typography variant="body2">FlyteRemote Usage</Typography>
      </Box>

      <Box
        sx={{
          display: expanded ? 'block' : 'none',
        }}
      >
        <Box className={classNames(styles.hoverWrapper, styles.codeWrapper)}>
          <SyntaxHighlighter
            language="python"
            style={docco}
            customStyle={{
              fontSize: '12px', // Adjust the font size as desired
              backgroundColor: errorBackgroundColor,
            }}
            wrapLongLines={true}
          >
            {code}
          </SyntaxHighlighter>

          <CopyButton
            buttonVariant="button"
            fontSize="small"
            onCopyClick={event => {
              event.preventDefault();

              copyToClipboard(code);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
