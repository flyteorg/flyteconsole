import * as React from 'react';
import { useState } from 'react';
import { Button, Typography } from '@material-ui/core';
import {
  graphButtonContainer,
  graphButtonStyle,
  leftPositionStyle,
  popupContainerStyle,
} from './commonStyles';
import t from './strings';

interface PausedTasksComponentProps {
  initialIsVisible?: boolean;
}

export const PausedTasksComponent: React.FC<PausedTasksComponentProps> = (props) => {
  const { initialIsVisible = false } = props;

  const [isVisible, setIsVisible] = useState(initialIsVisible);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const renderPausedTasksBlock = () => (
    <div style={popupContainerStyle}>
      <Typography variant="h3">To be replaced with a table</Typography>
    </div>
  );

  return (
    <div style={leftPositionStyle}>
      <div>
        {isVisible ? renderPausedTasksBlock() : null}
        <div style={graphButtonContainer}>
          <Button
            style={graphButtonStyle}
            color="default"
            id="graph-paused-tasks"
            onClick={toggleVisibility}
            variant="contained"
          >
            {t('pausedTasksButton')}
          </Button>
        </div>
      </div>
    </div>
  );
};
