import { ReactNode, createContext } from 'react';
import { log } from '../../../../../common/log';

export interface Mark {
  value: number;
  label?: string | ReactNode;
}

export const DEFAULT_SCALE_FACTOR = 1;

/** Use this Context to redefine Provider returns in storybooks */
export interface TimelineScaleState {
  scaleFactor: number;
  chartIntervalSeconds: number; // value in seconds for one tic of an interval
  marks: Mark[];
  setScaleFactor: (newScale: number) => void;
  roundedMaxScaleValueSeconds: number;
}

export const ScaleContext = createContext<TimelineScaleState>({
  /** Default values used if ContextProvider wasn't initialized. */
  scaleFactor: DEFAULT_SCALE_FACTOR,
  chartIntervalSeconds: 20,
  roundedMaxScaleValueSeconds: 60,
  marks: [],
  setScaleFactor: () => {
    log.error('ERROR: No ScaleContextProvider was found in parent components.');
  },
});
