import React from 'react';
import Box from '@mui/material/Box';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { env } from '@clients/common/environment';
import { FlyteSVGIcon } from '@clients/primitives/assets/icons/FlyteLogo';
import { PrettyError } from './PrettyError';

const DownForMaintenance = () => {
  const description =
    env.MAINTENANCE_MODE?.length && env.MAINTENANCE_MODE !== 'true'
      ? env.MAINTENANCE_MODE
      : "We're undergoing planned downtime maintenance. Please check back shortly.";
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/*">
          <Box
            sx={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <PrettyError
              title="Maintenance"
              description={description}
              showLinks={false}
              Icon={(props) => <FlyteSVGIcon {...props} />}
            />
          </Box>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default DownForMaintenance;
