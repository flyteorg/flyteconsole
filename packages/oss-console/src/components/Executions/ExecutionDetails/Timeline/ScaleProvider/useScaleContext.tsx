import { useContext } from 'react';
import { ScaleContext, TimelineScaleState } from './ScaleContext';

/** Could be used to access the whole TimelineScaleState */

export const useScaleContext = (): TimelineScaleState => useContext(ScaleContext);
