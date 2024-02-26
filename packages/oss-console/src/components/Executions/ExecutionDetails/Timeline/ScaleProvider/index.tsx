import React, { PropsWithChildren, useMemo, useState } from 'react';
import { formatSecondsToHmsFormat } from '../TimelineChart/utils';
import { DEFAULT_SCALE_FACTOR, Mark, ScaleContext } from './ScaleContext';

const MIN_SCALE_VALUE_SECONDS = 60; // 1 min

const percentage = [0.02, 0.1, 0.4, 0.6, 0.8, 1];
const MIN_SCALE_VALUE = 0;
const MAX_SCALE_VALUE = percentage.length - 1;

const TOP_MINUTES_VALUE = MIN_SCALE_VALUE_SECONDS * 60; // 1h
const TOP_HOURS_VALUE = TOP_MINUTES_VALUE * 24; // 1d

interface ScaleProviderProps {
  maxScaleValueSeconds: number;
  defaultScaleFactor?: number;
}

const getScaledSecondsValue = (value: number): number => {
  let roundedIntervalValue: number = value;

  if (value > TOP_HOURS_VALUE) {
    roundedIntervalValue = Math.ceil(value / TOP_HOURS_VALUE) * TOP_HOURS_VALUE;
  } else if (value > TOP_MINUTES_VALUE) {
    roundedIntervalValue = Math.ceil(value / TOP_MINUTES_VALUE) * TOP_MINUTES_VALUE;
  } else {
    roundedIntervalValue = Math.ceil(value / MIN_SCALE_VALUE_SECONDS) * MIN_SCALE_VALUE_SECONDS;
  }

  return roundedIntervalValue;
};

const getIntervalValue = (maxValue: number, percentage: number): number => {
  const intervalValue = Math.ceil(maxValue * percentage);
  const roundedIntervalValue =
    intervalValue < TOP_MINUTES_VALUE ? intervalValue : getScaledSecondsValue(intervalValue);

  return roundedIntervalValue > 0 ? roundedIntervalValue : 1;
};

/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const ScaleProvider = ({
  children,
  maxScaleValueSeconds = MIN_SCALE_VALUE_SECONDS,
  defaultScaleFactor = DEFAULT_SCALE_FACTOR,
}: PropsWithChildren<ScaleProviderProps>) => {
  const [scaleFactor, setScaleFactor] = useState<number>(defaultScaleFactor);

  const { chartIntervalSeconds, marks, roundedMaxScaleValueSeconds } = useMemo(() => {
    // round a value to have full amount of minutes: 1.5 -> 2, 1.2 -> 2, 1.8 -> 2, 1.9 -> 2
    const roundedMaxScaleValueSeconds = getScaledSecondsValue(maxScaleValueSeconds);

    const newMarks: Mark[] = roundedMaxScaleValueSeconds
      ? percentage.map((p, i) => {
          const label = formatSecondsToHmsFormat(getIntervalValue(roundedMaxScaleValueSeconds, p));
          return {
            value: i,
            label,
          };
        })
      : [];

    const chartIntervalSeconds = getIntervalValue(
      roundedMaxScaleValueSeconds,
      percentage[scaleFactor],
    );
    return {
      roundedMaxScaleValueSeconds,
      chartIntervalSeconds,
      marks: newMarks,
    };
  }, [maxScaleValueSeconds, scaleFactor]);

  const setNewScaleFactor = (newScaleFactor: number) => {
    setScaleFactor((prev) => {
      const newScale =
        newScaleFactor < 0
          ? MIN_SCALE_VALUE
          : newScaleFactor > MAX_SCALE_VALUE
          ? MAX_SCALE_VALUE
          : newScaleFactor;

      if (newScale === prev) {
        return prev;
      }
      return newScale;
    });
  };

  return (
    <ScaleContext.Provider
      value={{
        scaleFactor,
        chartIntervalSeconds,
        marks,
        setScaleFactor: setNewScaleFactor,
        roundedMaxScaleValueSeconds,
      }}
    >
      {children}
    </ScaleContext.Provider>
  );
};
