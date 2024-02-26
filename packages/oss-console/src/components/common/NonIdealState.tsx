import React, { PropsWithChildren } from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { type Variant } from '@mui/material/styles/createTypography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

type SizeValue = 'small' | 'medium' | 'large';
const iconSizes: Record<SizeValue, number> = {
  small: 40,
  medium: 64,
  large: 80,
};

const titleVariants: Record<SizeValue, Variant> = {
  small: 'body1',
  medium: 'h5',
  large: 'h4',
};

const descriptionVariants: Record<SizeValue, Variant> = {
  small: 'body2',
  medium: 'body1',
  large: 'body1',
};

export interface NonIdealStateProps {
  /** Optional className to be applied to the root component */
  className?: string;
  /** Optional description to be shown as body text for this state */
  description?: React.ReactNode;
  /** A component which renders the icon for this state */
  icon?: React.ComponentType<SvgIconProps>;
  /** A size variant to use. Defaults to 'medium' */
  size?: SizeValue;
  /** The primary message for this state, shown as header text */
  title: React.ReactNode;
}

/** A standard container for displaying a non-ideal state, such as an error,
 * a missing record, a lack of data based on a filter, or a degraded state which
 * requires user interaction to improve (ex. asking the user to make a selection).
 */
export const NonIdealState: React.FC<PropsWithChildren<NonIdealStateProps>> = ({
  children,
  className,
  description,
  icon: IconComponent,
  size = 'medium',
  title,
}) => {
  const icon = IconComponent ? (
    <div style={{ fontSize: iconSizes[size] }}>
      <IconComponent color="action" fontSize="inherit" />
    </div>
  ) : null;

  return (
    <Grid
      container
      className={className}
      sx={{ height: '100%', flexGrow: 1, textAlign: 'center' }}
      alignContent="center"
      justifyItems="center"
    >
      <Grid item xs={0} md={3}></Grid>
      <Grid item xs={12} md={6}>
        <Grid container justifyContent="center">
          {icon}
        </Grid>
        <Box sx={{ mb: 2 }} />
        <Grid container justifyContent="center" spacing={1}>
          <Grid item xs={12}>
            <Typography variant={titleVariants[size]}>{title}</Typography>
            {description && (
              <Grid item xs={12}>
                <Typography variant={descriptionVariants[size]}>{description}</Typography>
              </Grid>
            )}
          </Grid>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
