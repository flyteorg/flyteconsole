import React, { useState } from 'react';
import {
  FormControl,
  IconButton,
  Input,
  InputLabel,
  makeStyles,
} from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { useHistory } from 'react-router';
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
  const history = useHistory();
  const htmlLabel = `breadcrumb-${props.id}`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handlePopoverClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

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

  const styles = makeStyles(theme => ({
    formControl: {
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
  }))();

  return (
    <>
      <FormControl className={`breadcrumb-form-control ${styles.formControl}`}>
        <InputLabel
          htmlFor={htmlLabel}
          className="breadcrumb-form-control-label"
        >
          {props.label}
        </InputLabel>
        <Input
          name={htmlLabel}
          id={htmlLabel}
          value={props.value || props.defaultValue}
          readOnly={!!props.selfLink}
          disabled={!props.selfLink}
          role="button"
          tabIndex={0}
          className="breadcrumb-form-control-input"
          onClick={handleValueClick}
        />
      </FormControl>
      {!isMoreButtonHidden && (
        <IconButton
          className="breadcrumb-form-control-more-button"
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handlePopoverClick}
        >
          <ArrowDropDown />
        </IconButton>
      )}
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
