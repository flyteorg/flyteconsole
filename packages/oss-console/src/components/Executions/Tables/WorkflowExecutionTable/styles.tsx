import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useTheme } from '@mui/material/styles';

const namespace = 'WORKFLOW_EXECUTIONS_COLUMNS';

const styles: Record<string, string> = {
  columnActions: `${namespace}columnActions`,
  rightMargin: `${namespace}rightMargin`,
  confirmationButton: `${namespace}confirmationButton`,
  actionContainer: `${namespace}actionContainer`,
  actionProgress: `${namespace}actionProgress`,
};

export const WorkflowExecutionsColumnsStyles = () => {
  const theme = useTheme();
  return (
    <GlobalStyles
      styles={{
        [`.${styles.rightMargin}`]: {
          marginRight: theme.spacing(1),
        },
        [`.${styles.confirmationButton}`]: {
          borderRadius: 0,
          // make the button responsive, so the button won't overflow
          width: '50%',
          minHeight: '53px',
          // cancel margins that are coming from table row style
          marginTop: theme.spacing(-1),
          marginBottom: theme.spacing(-1),
        },
        [`.${styles.actionContainer}`]: {
          transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.easeInOut,
          }),
        },
        [`.${styles.actionProgress}`]: {
          width: '100px', // same as confirmationButton size
          textAlign: 'center',
        },
      }}
    />
  );
};

export const useStyles = () => {
  return styles;
};
