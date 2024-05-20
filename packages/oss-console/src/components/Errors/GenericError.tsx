import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import PageMeta from '@clients/primitives/PageMeta';
import Container from '@mui/material/Container';
import NotFoundLogo from '@clients/ui-atoms/NotFoundLogo';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export interface GenericErrorProps {
  title?: string | number;
  description?: string;
  content?: React.ReactNode;
  Icon?: (props: SvgIconProps) => React.JSX.Element;
}

/**
 * React prints the \n as "\n" in the DOM,
 * so we need to split on that to make new lines
 */
const makeDescriptionSpans = (description: string = '') => {
  const descriptionSpans = description.split('\\n').filter((span) => !!span);
  return descriptionSpans.map((span) => (
    <span key={span}>
      {span}
      <br />
    </span>
  ));
};

export const GenericError: React.FC<GenericErrorProps> = ({
  title,
  description,
  content,
  Icon = NotFoundLogo,
}) => {
  return (
    <>
      <PageMeta title={title?.toString()} />
      <Container
        sx={{
          height: '100%',
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid
          container
          gap={1}
          sx={{
            flexDirection: { xs: 'column-reverse', md: 'row' },
          }}
        >
          <Grid item xs={12} md={2} />
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              paddingRight: (t) => t.spacing(2),
              paddingBottom: (t) => t.spacing(2),
            }}
          >
            <Typography
              variant="h3"
              pb={1}
              sx={{
                fontSize: '22px',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: '42px',
              }}
            >
              {makeDescriptionSpans(description)}
            </Typography>

            {content}
          </Grid>
          <Grid item xs={12} md={1} py={3} sx={{ display: 'flex' }} />
          {Icon && (
            <Grid item xs={4} md={4} sx={{ display: 'flex' }}>
              <Icon
                sx={{
                  width: '100%',
                  height: '100%',
                  maxWidth: { xs: '150px', md: '250px' },
                  maxHeight: { xs: '150px', md: '250px' },
                  color: (theme) => theme.palette.common.grays[20],
                }}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};
