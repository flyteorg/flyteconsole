import { Button } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import FileCopy from '@material-ui/icons/FileCopy';
import classnames from 'classnames';
import {
  errorBackgroundColor,
  listhoverColor,
  nestedListColor,
  primaryHighlightColor,
  separatorColor,
} from 'components/Theme/constants';
import copyToClipboard from 'copy-to-clipboard';
import * as React from 'react';

const showOnHoverClass = 'showOnHover';

export const useScrollableMonospaceTextStyles = makeStyles((theme: Theme) => ({
  actionContainer: {
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  wrapper: {
    position: 'relative',
  },
  container: {
    backgroundColor: errorBackgroundColor,
    border: `1px solid ${separatorColor}`,
    borderRadius: 4,
    height: theme.spacing(12),
    minHeight: theme.spacing(12),
    overflowY: 'scroll',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column-reverse',
    '$nestedParent &': {
      backgroundColor: theme.palette.common.white,
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
  copyButton: {
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${primaryHighlightColor}`,
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
      backgroundColor: listhoverColor,
    },
  },
  errorMessage: {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
  },
  // Apply this class to an ancestor container to have the expandable text
  // use an alternate background color scheme.
  nestedParent: {
    backgroundColor: nestedListColor,
  },
}));

export interface ScrollableMonospaceTextProps {
  text: string;
}

/** An expandable/collapsible container which renders the provided text in a
 * monospace font. It also provides a button to copy the text.
 */
export const ScrollableMonospaceText: React.FC<
  ScrollableMonospaceTextProps
> = ({ text }) => {
  const styles = useScrollableMonospaceTextStyles();
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
    <div className={classnames(styles.wrapper)}>
      <div className={classnames(styles.container)} ref={scrollRef}>
        <div className={styles.errorMessage}>{`${text}`}</div>
        <div className={classnames(styles.actionContainer, showOnHoverClass)}>
          <Button
            color="primary"
            className={styles.copyButton}
            onClick={onClickCopy}
            variant="outlined"
          >
            <FileCopy fontSize="small" />
          </Button>
        </div>
      </div>
    </div>
  );
};
