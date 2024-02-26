import React from 'react';
import { useTheme } from '@mui/material/styles';
import classnames from 'classnames';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import { useCommonStyles } from './styles';

const StyledVariables = styled(Grid)(({ theme }) => ({
  fontSize: '14px',

  '.propName': {
    color: theme.palette.common.grays[30],
  },

  '.propValue': {
    color: theme.palette.common.grays[80],
  },
}));

export interface DetailsItem {
  name: string;
  content: string | JSX.Element;
}

interface DetailsGroupProps {
  className?: string;
  items: DetailsItem[];
}

/** Renders a list of detail items in a consistent style. Each item is shown in its own row with a label
 * to the left and the provided content to the right.
 */
export const DetailsGroup: React.FC<DetailsGroupProps> = ({ className, items }) => {
  const commonStyles = useCommonStyles();

  const theme = useTheme();
  return (
    <StyledVariables container className={classnames(className)}>
      <Grid item xs={12}>
        {items.map(({ name, content }) => (
          <Grid container key={name} sx={{ margin: `${theme.spacing(1)} 0` }}>
            <Grid item sx={{ width: '128px' }}>
              <Box
                className={classnames(commonStyles.textMuted, 'propName')}
                sx={{ marginRight: theme.spacing(2) }}
              >
                {name}
              </Box>
            </Grid>
            <Grid item lg={8} md={9} sm={6} xs={6}>
              <Typography className="propValue">{content}</Typography>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </StyledVariables>
  );
};
