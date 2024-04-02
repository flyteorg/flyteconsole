import { getScheduleFrequencyString, getScheduleOffsetString } from '../../common/formatters';
import { LaunchPlan } from '../../models/Launch/types';

export const getScheduleStringFromLaunchPlan = (launchPlan?: LaunchPlan) => {
  const { schedule } = launchPlan?.spec?.entityMetadata || {};
  const frequencyString = getScheduleFrequencyString(schedule);
  const offsetString = getScheduleOffsetString(schedule);
  const scheduleString = offsetString
    ? `${frequencyString} (offset by ${offsetString})`
    : frequencyString;

  return scheduleString;
};
