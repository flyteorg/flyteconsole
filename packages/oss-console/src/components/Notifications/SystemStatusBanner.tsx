import React from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Close from '@mui/icons-material/Close';
import Info from '@mui/icons-material/Info';
import Warning from '@mui/icons-material/Warning';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { Empty } from '../common/Empty';
import { LinkifiedText } from '../common/LinkifiedText';
import { WaitForData } from '../common/WaitForData';
import { StatusString, SystemStatus } from '../../models/Common/types';
import { useSystemStatus } from './useSystemStatus';

const StyledContainer = styled('div')(({ theme }) => ({
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  left: 0,
  // The parent container extends the full width of the page.
  // We don't want it intercepting pointer events for visible items below it.
  pointerEvents: 'none',
  position: 'fixed',
  padding: theme.spacing(2),
  right: 0,
  '& .closeButton': {
    alignItems: 'center',
    color: CommonStylesConstants.mutedButtonColor,
    '&:hover': {
      color: CommonStylesConstants.mutedButtonHoverColor,
    },
    display: 'flex',
    height: theme.spacing(3),
  },
  '& .statusPaper': {
    display: 'flex',
    padding: theme.spacing(2),
    pointerEvents: 'initial',
  },
  '& .statusContentContainer': {
    alignItems: 'flex-start',
    display: 'flex',
    maxWidth: theme.spacing(131),
  },
  '& .statusClose': {
    alignItems: 'flex-start',
    display: 'flex',
    flex: '0 0 auto',
  },
  '& .statusIcon': {
    alignItems: 'center',
    display: 'flex',
    flex: '0 0 auto',
    lineHeight: `${theme.spacing(3)}`,
  },
  '& .statusMessage': {
    flex: '1 1 auto',
    fontWeight: 'normal',
    lineHeight: `${theme.spacing(3)}`,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

const InfoIcon = () => (
  <Info data-testid="info-icon" htmlColor={CommonStylesConstants.infoIconColor} />
);

const WarningIcon = () => (
  <Warning data-testid="warning-icon" htmlColor={CommonStylesConstants.warningIconColor} />
);

const statusIcons: Record<StatusString, React.ComponentType> = {
  normal: InfoIcon,
  degraded: WarningIcon,
  down: WarningIcon,
};

const StatusIcon: React.FC<{ status: StatusString }> = ({ status }) => {
  const IconComponent = statusIcons[status] || statusIcons.normal;
  return <IconComponent />;
};

export const RenderSystemStatusBanner: React.FC<{
  systemStatus: SystemStatus;
  onClose: () => void;
}> = ({ systemStatus: { message, status }, onClose }) => {
  return (
    <StyledContainer>
      <Paper role="banner" className="statusPaper" elevation={1} square>
        <div className="statusIcon">
          <StatusIcon status={status} />
        </div>
        <div className="statusContentContainer">
          <Typography variant="h6" className="statusMessage">
            <LinkifiedText text={message} />
          </Typography>
        </div>
        <div className="statusClose">
          <ButtonBase aria-label="Close" className="closeButton" onClick={onClose}>
            <Close fontSize="small" />
          </ButtonBase>
        </div>
      </Paper>
    </StyledContainer>
  );
};

/** Fetches and renders the system status returned by issuing a GET to
 * `env.STATUS_URL`. If the status includes a message, a dismissable toast
 * will be rendered. Otherwise, nothing will be rendered.
 */
export const SystemStatusBanner: React.FC<{}> = () => {
  const systemStatus = useSystemStatus();
  const [dismissed, setDismissed] = React.useState(false);
  const onClose = () => setDismissed(true);
  if (dismissed) {
    return null;
  }
  return (
    <WaitForData {...systemStatus} loadingComponent={Empty} errorComponent={Empty}>
      {systemStatus.value.message ? (
        <RenderSystemStatusBanner systemStatus={systemStatus.value} onClose={onClose} />
      ) : null}
    </WaitForData>
  );
};
