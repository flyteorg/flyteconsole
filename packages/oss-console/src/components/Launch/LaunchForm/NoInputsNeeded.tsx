import React from 'react';
import Typography from '@mui/material/Typography';
import classnames from 'classnames';
import { useCommonStyles } from '../../common/styles';
import { workflowNoInputsString } from './constants';
import t from './strings';

export interface NoInputsProps {
  variant: 'workflow' | 'task';
}
/** An informational message to be shown if a Workflow or Task does not need any
 * input values.
 */
export const NoInputsNeeded: React.FC<NoInputsProps> = ({ variant }) => {
  const commonStyles = useCommonStyles();
  return (
    <Typography
      align="center"
      className={classnames(commonStyles.hintText)}
      variant="body2"
      sx={{ my: 2 }}
    >
      {variant === 'workflow' ? workflowNoInputsString : t('taskNoInputsString')}
    </Typography>
  );
};
