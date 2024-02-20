import { type Theme } from '@mui/system/createTheme/createTheme';

export const unstyledLinkProps = {
  textDecoration: 'none',
  color: 'inherit',
};

export const horizontalListSpacing = (spacing: string) => ({
  '& > :not(:first-of-type)': {
    marginLeft: spacing,
  },
});

export const buttonGroup = (theme: Theme) => ({
  ...horizontalListSpacing(theme.spacing(1)),
  display: 'flex',
});
