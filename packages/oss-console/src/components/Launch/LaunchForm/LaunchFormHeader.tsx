import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { useStyles } from './styles';

interface LaunchFormHeaderProps {
  title?: string;
  formTitle: string;
}

/** Shared header component for the Launch form */
export const LaunchFormHeader: React.FC<LaunchFormHeaderProps> = ({ title = '', formTitle }) => {
  const styles = useStyles();
  return (
    <DialogTitle component="div">
      <div className={classNames(styles.header, styles.inputLabel)}>{formTitle}</div>
      <Typography
        component="h6"
        className={classNames(styles.header)}
        sx={{
          lineBreak: 'anywhere',
        }}
      >
        {title}
      </Typography>
    </DialogTitle>
  );
};
