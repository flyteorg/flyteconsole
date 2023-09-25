import * as React from 'react';
import { SvgIconProps, SvgIcon } from '@material-ui/core';

export const MuiLaunchPlanIcon = (props: SvgIconProps) => {
  const { fill, ...rest } = props;
  return (
    <SvgIcon viewBox="0 0 24 24" {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 4.963 19.792 L 4.963 4.208 C 4.963 3.545 5.5 3.009 6.162 3.009 L 17.837 3.009 C 18.501 3.009 19.037 3.545 19.037 4.208 L 19.037 15.527 L 14.345 15.527 L 13.746 15.527 L 13.746 16.126 L 13.746 20.991 L 6.162 20.991 C 5.5 20.991 4.963 20.454 4.963 19.792 Z M 14.945 16.724 L 18.612 16.724 L 14.945 20.393 L 14.945 16.724 Z M 8.717 8.924 L 15.753 8.924 L 15.753 7.725 L 8.717 7.725 L 8.717 8.924 Z M 15.753 12.4 L 8.717 12.4 L 8.717 11.201 L 15.753 11.201 L 15.753 12.4 Z M 8.717 15.873 L 12.192 15.873 L 12.192 14.676 L 8.717 14.676 L 8.717 15.873 Z"
        fill={fill || 'currentColor'}
      />
    </SvgIcon>
  );
};
