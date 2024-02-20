import React from 'react';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import classnames from 'classnames';
import { useCommonStyles } from './styles';

export const EntityCardError: React.FC<{ errorMessage: string }> = ({ errorMessage }) => {
  const { flexCenter, hintText, iconRight } = useCommonStyles();
  return (
    <div data-testid="entity-error-card" className={classnames('errorContainer', flexCenter)}>
      <ErrorOutline fontSize="small" color="disabled" />
      <div className={classnames(iconRight, hintText)}>{errorMessage}</div>
    </div>
  );
};
