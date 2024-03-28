import React, { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import ErrorIcon from '@mui/icons-material/Error';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';

interface WarningTextProps {
  text?: string;
  showWarningIcon?: boolean;
  tooltipText?: string;
}
const WarningText = ({ text, showWarningIcon, tooltipText }: WarningTextProps) => {
  const content = useMemo(
    () => (
      <Grid container>
        {showWarningIcon ? (
          <ErrorIcon
            sx={{
              fontSize: 18,
              marginRight: '4px',
              color: (theme) => theme.palette.common.state.queued,
            }}
          />
        ) : null}
        <Typography variant="body2">{text}</Typography>
      </Grid>
    ),
    [text, showWarningIcon],
  );
  return tooltipText ? (
    <Tooltip data-testid="warn-tooltip" title={<>{tooltipText}</>}>
      {content}
    </Tooltip>
  ) : (
    content
  );
};

export default WarningText;
