import React, { useState } from 'react';
import {
  FormControl,
  IconButton,
  TextField,
  makeStyles,
} from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { useHistory } from 'react-router';
import classNames from 'classnames';
import { COLOR_SPECTRUM } from 'components/Theme/colorSpectrum';
import { BreadcrumbFormControlInterface } from '../types';
import BreadcrumbPopOver from './BreadcrumbPopover';
import { defaultVoid } from '../async/fn';

/**
 * This component is a wrapper around the Material UI FormControl component.
 * It is used to render a breadcrumb with a popover.
 *
 * These are used in the Breadcrumbs component.
 */
const BreadcrumbFormControl = (props: BreadcrumbFormControlInterface) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const history = useHistory();
  const htmlLabel = `breadcrumb-${props.id}`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handlePopoverClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const toggleHover = () => setHovered(h => !h);
  const togglePressed = () => setPressed(p => !p);

  const handleValueClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (props.selfLink) {
      if (typeof props.selfLink === 'function') {
        history.push(props.selfLink(window.location, props));
      } else {
        history.push(props.selfLink);
      }
    }
  };

  const isMoreButtonHidden =
    props.asyncData.name === defaultVoid.name && props.viewAllLink === '';

  const value = (props.value || props.defaultValue) as string;
  const width = value.length;

  const styles = makeStyles(theme => ({
    formControl: {
      // ch = character with of 0 character in font
      width: width ? `${width || 2}ch` : 'auto',
      maxWidth: '200pt',
      '& input': {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      },
      '& .breadcrumb-form-control-input': {
        '& *': {
          cursor: props.selfLink ? 'pointer' : 'default',
        },
        '&.Mui-disabled': {
          '&:before, &:after': {
            borderBottom: '0px solid transparent !important',
          },
          '& input': {
            color: theme.palette.text.primary,
          },
        },
      },
    },
    moreButton: {
      width: '20px',
      height: '20px',
      borderRadius: '5px',
      color: () => {
        if (pressed) {
          return COLOR_SPECTRUM.white.color;
        }

        return COLOR_SPECTRUM.indigo80.color;
      },
      backgroundColor: () => {
        if (pressed) {
          return COLOR_SPECTRUM.indigo80.color;
        }

        return 'transparent';
      },
      '&:hover': {
        backgroundColor: () => {
          if (pressed) {
            return COLOR_SPECTRUM.indigo80.color;
          }

          return 'transparent';
        },
        border: `1px solid ${COLOR_SPECTRUM.indigo80.color}`,
      },
    },
  }))();

  return (
    <>
      <FormControl
        className={classNames(styles.formControl, 'breadcrumb-form-control')}
        onMouseOver={toggleHover}
        onMouseOut={toggleHover}
        onMouseDown={togglePressed}
        onMouseUp={togglePressed}
      >
        {/* <InputLabel
          htmlFor={htmlLabel}
          className="breadcrumb-form-control-label"
        >
          {props.label}
        </InputLabel> */}
        <TextField
          name={htmlLabel}
          id={htmlLabel}
          value={value}
          disabled={!props.selfLink}
          role="button"
          tabIndex={0}
          className="breadcrumb-form-control-input"
          onClick={handleValueClick}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleValueClick(e);
            }
          }}
          title={value}
          InputProps={{
            disableUnderline: !hovered && !pressed,
            readOnly: !!props.selfLink,
            endAdornment: !isMoreButtonHidden && (
              <IconButton
                className={classNames(styles.moreButton, 'breadcrumb-more')}
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handlePopoverClick}
                size="small"
                disableTouchRipple
                disableFocusRipple
                disableRipple
              >
                <ArrowDropDown />
              </IconButton>
            ),
          }}
        />
      </FormControl>
      {!!anchorEl && (
        <BreadcrumbPopOver
          onClose={handlePopoverClose}
          anchorEl={anchorEl}
          open={!!anchorEl}
          {...props}
        />
      )}
    </>
  );
};

export default BreadcrumbFormControl;
