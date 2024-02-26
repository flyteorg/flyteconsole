import React, { useMemo } from 'react';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import FileCopy from '@mui/icons-material/FileCopy';
import classnames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';

const expandedClass = 'expanded';
const showOnHoverClass = 'showOnHover';

const StyledContainer = styled('div')(({ theme }) => ({
  backgroundColor: CommonStylesConstants.errorBackgroundColor,
  border: `1px solid ${CommonStylesConstants.separatorColor}`,
  borderRadius: 4,
  height: theme.spacing(12),
  minHeight: theme.spacing(12),
  overflowY: 'hidden',
  padding: theme.spacing(2),
  position: 'relative',
  '.nestedParent &': {
    backgroundColor: theme.palette.common.primary.white,
  },
  [`&.${expandedClass}`]: {
    height: 'auto',
    paddingBottom: theme.spacing(8),
  },
  // All children using the showOnHover class will be hidden until
  // the mouse enters the container
  [`& .${showOnHoverClass}`]: {
    transition: `all 0.25s ease-in-out`,
    opacity: 0,
  },
  [`&:hover .${showOnHoverClass}`]: {
    opacity: 1,
  },
  '& .actionContainer': {
    position: 'absolute',
    inset: 0,
  },
  '& .bottomFade': {
    background: 'linear-gradient(rgba(255,252,252,0.39), rgba(255,255,255,0.79))',
    bottom: 0,
    height: theme.spacing(4),
    left: 0,
    position: 'absolute',
    right: 0,
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
    right: theme.spacing(1),
    top: theme.spacing(1),
    width: theme.spacing(4),
    '&:hover': {
      backgroundColor: CommonStylesConstants.listhoverColor,
    },
  },
  '& .errorMessage': {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
  },
  '& .expandButton': {
    backgroundColor: theme.palette.common.grays[40],
    borderRadius: 16,
    bottom: theme.spacing(4),
    color: theme.palette.common.primary.white,
    fontFamily: CommonStylesConstants.bodyFontFamily,
    fontSize: CommonStylesConstants.smallFontSize,
    fontWeight: 'bold',
    left: '50%',
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
    position: 'absolute',
    transform: 'translateX(-50%)',
    '&:hover': {
      backgroundColor: theme.palette.common.grays[30],
    },
    [`&.${expandedClass}`]: {
      bottom: theme.spacing(2),
    },
  },
  // Apply this class to an ancestor container to have the expandable text
  // use an alternate background color scheme.
  '& .nestedParent': {
    backgroundColor: CommonStylesConstants.nestedListColor,
  },
}));

export interface ExpandableMonospaceTextProps {
  initialExpansionState?: boolean;
  text: string;
  onExpandCollapse?: (expanded: boolean) => void;
  isLoading?: boolean;
}

/** An expandable/collapsible container which renders the provided text in a
 * monospace font. It also provides a button to copy the text.
 */
export const ExpandableMonospaceText: React.FC<ExpandableMonospaceTextProps> = ({
  onExpandCollapse,
  initialExpansionState = false,
  isLoading = false,
  text,
}) => {
  const [expanded, setExpanded] = React.useState(initialExpansionState);

  const onClickExpand = (e: React.MouseEvent<HTMLElement>) => {
    // prevent the parent row body onClick event trigger
    e.stopPropagation();

    setExpanded(!expanded);
    if (onExpandCollapse) {
      onExpandCollapse(!expanded);
    }
  };
  const onClickCopy = (e: React.MouseEvent<HTMLElement>) => {
    // prevent the parent row body onClick event trigger
    e.stopPropagation();
    copyToClipboard(text);
  };

  const utf8Text = useMemo(() => {
    return Buffer.from(text, 'utf-8').toString();
  }, [text]);

  const expandButtonText = expanded ? 'Collapse' : 'Click to expand inline';

  return (
    <StyledContainer
      className={classnames('container', {
        [expandedClass]: expanded,
      })}
    >
      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <>
          <div className="errorMessage">{utf8Text}</div>
          {expanded ? null : <div className="bottomFade" />}
          <ButtonBase
            disableRipple
            onClick={onClickExpand}
            className={classnames('expandButton', showOnHoverClass, {
              [expandedClass]: expanded,
            })}
          >
            {expandButtonText}
          </ButtonBase>
          <Button
            color="primary"
            className={classnames('copyButton', showOnHoverClass)}
            onClick={onClickCopy}
            variant="outlined"
          >
            <FileCopy fontSize="small" />
          </Button>
        </>
      )}
    </StyledContainer>
  );
};
