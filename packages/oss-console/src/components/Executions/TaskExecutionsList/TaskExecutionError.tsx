import React from 'react';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { ExpandableContentLink } from '../../common/ExpandableContentLink';
import { ExecutionError } from '../../../models/Execution/types';

/** Renders an expandable error for a `TaskExecution` */
export const TaskExecutionError: React.FC<{ error: ExecutionError }> = ({ error }) => {
  const renderContent = () => (
    <Alert elevation={0} severity="error" icon={null}>
      <Typography fontFamily="monospace">{error.message}</Typography>
    </Alert>
  );
  return (
    <ExpandableContentLink
      allowCollapse
      collapsedText="Show Error"
      expandedText="Hide Error"
      renderContent={renderContent}
    />
  );
};
