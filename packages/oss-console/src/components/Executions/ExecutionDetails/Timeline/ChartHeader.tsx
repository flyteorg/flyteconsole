import React, { ForwardedRef, forwardRef } from 'react';
import moment from 'moment-timezone';
import styled from '@mui/system/styled';
import { useScaleContext } from './ScaleProvider/useScaleContext';
import { TimeZone } from './helpers';

interface StyleProps {
  chartWidth: number;
  labelInterval: number;
}

interface HeaderProps extends StyleProps {
  chartTimezone: string;
  startedAt: Date;
}

const ChartHeaderContainer = styled('div')<HeaderProps>(({ chartWidth, labelInterval, theme }) => ({
  overflow: 'hidden',
  borderBottom: `4px solid ${theme.palette.divider}`,

  '.timeline-chart-scroll': {
    height: 41,
    display: 'flex',
    alignItems: 'center',
    width: chartWidth,
  },

  '.taskDurationsLabelItem': {
    fontSize: 12,
    color: theme.palette.common.grays[40],
    paddingLeft: 10,
    width: labelInterval,
  },
}));

export const ChartHeader = forwardRef(
  (props: HeaderProps, taskNamesRef: ForwardedRef<HTMLDivElement>) => {
    const { chartIntervalSeconds, roundedMaxScaleValueSeconds } = useScaleContext();
    const { startedAt, chartTimezone } = props;

    const labels = React.useMemo(() => {
      const len = Math.ceil(roundedMaxScaleValueSeconds / chartIntervalSeconds);
      const lbs = new Array(len).fill('');
      return lbs.map((_, idx) => {
        const time = moment.utc(new Date(startedAt.getTime() + idx * chartIntervalSeconds * 1000));
        return chartTimezone === TimeZone.UTC
          ? time.format('hh:mm:ss A')
          : time.local().format('hh:mm:ss A');
      });
    }, [chartTimezone, startedAt, chartIntervalSeconds, roundedMaxScaleValueSeconds]);

    return (
      <ChartHeaderContainer {...props} ref={taskNamesRef}>
        <div className="timeline-chart-scroll">
          {labels.map((label, i) => {
            return (
              <div className={`taskDurationsLabelItem label_${i}`} key={`label_${i}`}>
                {label}
              </div>
            );
          })}
        </div>
      </ChartHeaderContainer>
    );
  },
);
