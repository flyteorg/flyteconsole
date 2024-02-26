import React, { PropsWithChildren } from 'react';
import copyToClipboard from 'copy-to-clipboard';
import classnames from 'classnames';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import styled from '@mui/system/styled';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

const showOnHoverClass = 'showOnHover';

const StyledCopyableWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 'fit-content',
  alignItems: 'center',
  cursor: 'pointer',

  [`&:hover`]: {
    '& .copyButton': {
      opacity: 1,
    },
  },

  '& .copyButton': {
    padding: 0,
    margin: '0 0 0 3px',
    color: theme.palette?.common?.blue[6],
    border: 'none',
    backgroundColor: 'transparent',
    opacity: 0,
    transition: `all 0.25s ease-in-out`,

    '& svg': {
      fontSize: '14px',
    },

    [`&:hover`]: {
      opacity: 1,
    },
  },
}));

export type CopyableWrapperProps = PropsWithChildren<{
  copyText: string | number;
  isCopyable?: boolean;
}>;
export const CopyableWrapper = ({ copyText, isCopyable, children }: CopyableWrapperProps) => {
  const onClickCopy = (e: React.MouseEvent<HTMLElement>) => {
    // prevent the parent row body onClick event trigger
    e.stopPropagation();
    copyToClipboard(copyText.toString());
  };

  if (isCopyable) {
    return (
      <StyledCopyableWrapper onClick={onClickCopy} sx={{ display: 'inline-flex' }}>
        {children}
        {/* <Button
          color="primary"
          
          onClick={onClickCopy}
          variant="outlined"
        > */}
        <IconButton
          color="primary"
          className={classnames('copyButton', showOnHoverClass)}
          onClick={onClickCopy}
        >
          <ContentCopyIcon />
        </IconButton>
        {/* </Button> */}
      </StyledCopyableWrapper>
    );
  }

  return <>{children}</>;
};
