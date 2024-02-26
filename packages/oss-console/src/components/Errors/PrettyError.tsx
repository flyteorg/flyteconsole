import React from 'react';
import PageMeta from '@clients/primitives/PageMeta';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useParams } from 'react-router';
import NotFoundLogo from '@clients/ui-atoms/NotFoundLogo';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { Routes } from '../../routes/routes';
import {
  LOCAL_STORE_DEFAULTS,
  LocalStorageProjectDomain,
  getLocalStore,
} from '../common/LocalStoreDefaults';

export const PrettyError = ({
  title = '404 Not Found',
  description = "We can't find the page that you're looking for.",
  showLinks = true,
  Icon = NotFoundLogo,
}: {
  title?: string;
  description?: string;
  showLinks?: boolean;
  Icon?: (props: SvgIconProps) => React.JSX.Element;
}) => {
  const params = useParams<{ projectId?: string; domainId?: string }>();

  const makeProjectUrl = () => {
    const localPD: LocalStorageProjectDomain = getLocalStore(LOCAL_STORE_DEFAULTS, {
      project: '',
      domain: '',
    });

    const project = params.projectId || localPD.project || '';
    const domain = params.domainId || localPD.domain || '';

    if (project && domain) {
      return Routes.ProjectDashboard.makeUrl(project, domain);
    }
    return Routes.SelectProject.path;
  };

  /**
   * React prints the \n as "\n" in the DOM,
   * so we need to split on that to make new lines
   */
  const makeDescriptionSpans = () => {
    const descriptionSpans = description.split('\\n').filter((span) => !!span);
    return descriptionSpans.map((span) => (
      <span key={span}>
        {span}
        <br />
      </span>
    ));
  };

  return (
    <>
      <PageMeta title={title} />
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
            <Typography variant="h1" pb={1}>
              {title}
            </Typography>
            <Typography variant="h3">{makeDescriptionSpans()}</Typography>

            {showLinks && (
              <>
                <Box py={3} />

                <Typography variant="h3">
                  <strong>Here are the some helpful links instead:</strong>
                </Typography>

                <Box py={1} />

                <Box pb={1}>
                  <Link color="secondary" href={makeProjectUrl()}>
                    Back to Project
                  </Link>
                </Box>

                <Box pb={1}>
                  <Link color="secondary" href="https://docs.flyte.org/en/latest/">
                    Flyte Docs
                  </Link>
                </Box>
              </>
            )}
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
                }}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};
