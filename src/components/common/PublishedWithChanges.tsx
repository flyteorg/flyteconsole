import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';

/** SvgIcon version of the MUI PublishedWithChangesOutlined version.
 * This is created manually because it's not available in the MUI React library.
 * Source icon is https://material.io/resources/icons/?search=publish&icon=published_with_changes&style=outline
 */
export const PublishedWithChangesOutlined: React.FC<SvgIconProps> = React.forwardRef(
    (props, ref) => (
        <SvgIcon {...props} ref={ref}>
            <path d="M18.6,19.5H21v2h-6v-6h2v2.73c1.83-1.47,3-3.71,3-6.23c0-4.07-3.06-7.44-7-7.93V2.05c5.05,0.5,9,4.76,9,9.95 C22,14.99,20.68,17.67,18.6,19.5z M4,12c0-2.52,1.17-4.77,3-6.23V8.5h2v-6H3v2h2.4C3.32,6.33,2,9.01,2,12c0,5.19,3.95,9.45,9,9.95 v-2.02C7.06,19.44,4,16.07,4,12z M16.24,8.11l-5.66,5.66l-2.83-2.83l-1.41,1.41l4.24,4.24l7.07-7.07L16.24,8.11z" />
        </SvgIcon>
    )
);
