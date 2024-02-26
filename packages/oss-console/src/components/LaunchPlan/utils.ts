import isNumber from 'lodash/isNumber';
import Admin from '@clients/common/flyteidl/admin';
import cronParser from 'cron-parser';
import { Execution } from '../../models/Execution/types';
import { timestampToMilliseconds } from '../../common/utils';
import { LaunchPlan, LaunchPlanState } from '../../models/Launch/types';

export const getRateValueMs = (rate?: Admin.IFixedRate | null) => {
  if (!rate) {
    return 0;
  }
  switch (rate.unit) {
    case Admin.FixedRateUnit.DAY: {
      return rate.value! * 24 * 60 * 60 * 1000;
    }
    case Admin.FixedRateUnit.HOUR: {
      return rate.value! * 60 * 60 * 1000;
    }
    default: {
      return rate.value! * 60 * 1000;
    }
  }
};

export const getNextExecutionTimeMilliseconds = (
  execution?: Execution,
  launchPlan?: LaunchPlan,
) => {
  // return if launchplan is not active
  if (!launchPlan || launchPlan?.closure?.state !== LaunchPlanState.ACTIVE) {
    return undefined;
  }

  // get scheduledAt date from execution, fallback on launch_plan
  const scheduledAt =
    execution?.spec.metadata.scheduledAt ||
    execution?.closure?.createdAt! ||
    launchPlan?.closure?.updatedAt! ||
    launchPlan?.closure?.createdAt!;

  const lastExecutionTimeInMilliseconds = timestampToMilliseconds(scheduledAt);
  let nextPotentialExecutionTime = lastExecutionTimeInMilliseconds;
  const { schedule } = launchPlan.spec.entityMetadata;
  const { value: rateValue, unit: rateUnit } = schedule?.rate || {};

  // Note: `cronExpression` is deprecated and only used here for fallback support
  // we'll want to remove it when we can.
  const cronSchedule = (launchPlan?.spec.entityMetadata?.schedule?.cronSchedule || '') as string;

  if (isNumber(rateValue) && isNumber(rateUnit)) {
    const rateMs = getRateValueMs(schedule?.rate);
    nextPotentialExecutionTime += rateMs;
  } else if (
    launchPlan?.spec.entityMetadata?.schedule?.cronSchedule !== undefined &&
    launchPlan?.closure?.state !== undefined
  ) {
    let interval = cronParser.parseExpression(cronSchedule, {
      currentDate: new Date(lastExecutionTimeInMilliseconds),
      iterator: true,
    });
    const currentTimeInMillis = new Date().getTime();
    nextPotentialExecutionTime = interval.next().value.getTime();
    if (nextPotentialExecutionTime < currentTimeInMillis) {
      interval = cronParser.parseExpression(cronSchedule, {
        currentDate: new Date(currentTimeInMillis),
        iterator: true,
      });
      nextPotentialExecutionTime = interval.next().value.getTime();
    }
  }

  return nextPotentialExecutionTime;
};
