import { Button, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import * as React from 'react';
import { env } from 'common/env';

import { PoweredByUnionIcon } from './PoweredByUnionIcon';

interface TimeLeftType {
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (endTime: Date): TimeLeftType => {
  const difference = endTime.getTime() - new Date().getTime();

  const timeLeft = {
    hours: Math.floor(difference / (1000 * 60 * 60)),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };

  return timeLeft;
};

export const OverlaySandboxTimer = (props) => {
  const { children } = props;
  const history = useHistory();

  const [endDate] = React.useState(
    env.SANDBOX_EXPIRED_TIMESTAMP
      ? new Date(parseInt(env.SANDBOX_EXPIRED_TIMESTAMP, 10))
      : new Date(new Date().setMinutes(59)),
  );
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft(endDate));

  React.useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
  });

  let remainingTimeText = '';
  let lessThanFiveMins = false;
  const hourText = timeLeft.hours > 1 ? 'hours' : 'hour';
  const minsText = timeLeft.minutes > 1 ? 'mins' : 'min';
  const secsText = timeLeft.seconds > 1 ? 'secs' : 'sec';
  if (timeLeft.hours > 0) {
    remainingTimeText = `${timeLeft.hours}${hourText} ${timeLeft.minutes}${minsText}`;
  } else {
    if (timeLeft.minutes < 5) {
      lessThanFiveMins = true;
    }
    remainingTimeText = `${timeLeft.minutes}${minsText} ${timeLeft.seconds}${secsText}`;
  }

  return (
    <div>
      <div
        style={{
          background: '#000',
          height: 56,
          position: 'absolute',
          right: 5,
          borderRadius: 8,
          bottom: 5,
          zIndex: 1000000000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <Button
          style={{
            background: '#fff',
            color: '#000',
            borderRadius: 8,
            width: 113,
            height: 32,
          }}
          onClick={() => {
            history.push('/');
          }}
        >
          Code Editor
        </Button>
        <Typography
          style={{
            color: lessThanFiveMins ? '#F38A96' : '#fff',
          }}
        >
          {`Time Remaining: ${remainingTimeText}`}
        </Typography>
        <PoweredByUnionIcon
          onClick={() => {
            window.location.href = 'https://www.union.ai/';
          }}
        />
      </div>
      {children}
    </div>
  );
};
