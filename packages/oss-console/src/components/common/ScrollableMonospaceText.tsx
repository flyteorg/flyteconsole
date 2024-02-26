import React, { forwardRef } from 'react';
import Button from '@mui/material/Button';
import FileCopy from '@mui/icons-material/FileCopy';
import classnames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';

const showOnHoverClass = 'showOnHover';

const StyledWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  '& .container': {
    backgroundColor: CommonStylesConstants.errorBackgroundColor,
    border: `1px solid ${CommonStylesConstants.separatorColor}`,
    borderRadius: 4,
    height: 'fit-content',
    maxHeight: theme.spacing(30),
    overflowY: 'scroll',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column-reverse',
    '.nestedParent &': {
      backgroundColor: theme.palette.common.primary.white,
    },
    // All children using the showOnHover class will be hidden until
    // the mouse enters the container
    [`& .${showOnHoverClass}`]: {
      opacity: 0,
    },
    [`&:hover .${showOnHoverClass}`]: {
      opacity: 1,
    },
  },
  '& .errorMessage': {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
  },
  '& .copyButton': {
    backgroundColor: theme.palette.common.primary.white,
    border: `1px solid ${CommonStylesConstants.primaryHighlightColor}`,
    borderRadius: theme.spacing(1),
    color: theme.palette.text.secondary,
    height: theme.spacing(4),
    minWidth: 0,
    padding: 0,
    position: 'absolute',
    right: theme.spacing(3),
    top: theme.spacing(1),
    width: theme.spacing(4),
    '&:hover': {
      backgroundColor: CommonStylesConstants.listhoverColor,
    },
  },
  '& .actionContainer': {
    transition: 'opacity 0.25s ease-in-out',
  },
}));

export interface ScrollableMonospaceTextProps
  extends Partial<Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>> {
  text: string;
  content?: JSX.Element;
}

/** An expandable/collapsible container which renders the provided text in a
 * monospace font. It also provides a button to copy the text.
 */
export const ScrollableMonospaceText = forwardRef<HTMLDivElement, ScrollableMonospaceTextProps>(
  ({ text, content, ...rest }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const onClickCopy = (e: React.MouseEvent<HTMLElement>) => {
      // prevent the parent row body onClick event trigger
      e.stopPropagation();
      copyToClipboard(text);
    };

    React.useEffect(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
      });
    }, [text, scrollRef.current]);

    return (
      <StyledWrapper ref={ref} {...rest}>
        <div className={classnames('container')} ref={scrollRef}>
          <div className="errorMessage">{content || text}</div>
          <div className={classnames('actionContainer', showOnHoverClass)}>
            <Button color="primary" className="copyButton" onClick={onClickCopy} variant="outlined">
              <FileCopy fontSize="small" />
            </Button>
          </div>
        </div>
      </StyledWrapper>
    );
  },
);
