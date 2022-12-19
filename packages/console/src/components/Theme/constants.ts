/* eslint import/no-mutable-exports: 1 */
import { AppConfig, FlyteNavigation } from '@flyteoss/common';
import { TaskType } from 'models/Task/constants';
import { COLOR_SPECTRUM } from './colorSpectrum';

export let bodyFontFamily = 'Lato, helvetica, arial, sans-serif';
export const headerFontFamily = '"Open Sans", helvetica, arial, sans-serif';

export const whiteColor = COLOR_SPECTRUM.white.color;
// eslint-disable-next-line import/no-mutable-exports
export let primaryColor = COLOR_SPECTRUM.purple60.color;
// eslint-disable-next-line import/no-mutable-exports
export let primaryLightColor = COLOR_SPECTRUM.purple30.color;
// eslint-disable-next-line import/no-mutable-exports
export let primaryDarkColor = COLOR_SPECTRUM.purple70.color;
// eslint-disable-next-line import/no-mutable-exports
export let primaryHighlightColor = COLOR_SPECTRUM.purple60.color;
export const secondaryColor = COLOR_SPECTRUM.indigo100.color;
export const secondaryBackgroundColor = COLOR_SPECTRUM.gray5.color;

export const primaryTextColor = COLOR_SPECTRUM.gray100.color;
export const secondaryTextColor = COLOR_SPECTRUM.gray60.color;
// eslint-disable-next-line import/no-mutable-exports
export let interactiveTextColor = COLOR_SPECTRUM.purple60.color;
// eslint-disable-next-line import/no-mutable-exports
export let interactiveTextDisabledColor = COLOR_SPECTRUM.purple30.color;
// eslint-disable-next-line import/no-mutable-exports
export let interactiveTextBackgroundColor = COLOR_SPECTRUM.purple5.color;
// eslint-disable-next-line
export let positiveTextColor = COLOR_SPECTRUM.mint60.color;
// eslint-disable-next-line
export let negativeTextColor = COLOR_SPECTRUM.sunset60.color;
export const mutedPrimaryTextColor = '#4A4A4A';

export const tableHeaderColor = COLOR_SPECTRUM.gray40.color;
export const tablePlaceholderColor = COLOR_SPECTRUM.gray40.color;

export const selectedActionColor = COLOR_SPECTRUM.gray10.color;

export const separatorColor = COLOR_SPECTRUM.gray15.color;
export const skeletonColor = COLOR_SPECTRUM.gray15.color;
export const skeletonHighlightColor = COLOR_SPECTRUM.gray0.color;
export const listhoverColor = COLOR_SPECTRUM.gray5.color;
export const nestedListColor = COLOR_SPECTRUM.gray0.color;
export const buttonHoverColor = COLOR_SPECTRUM.gray0.color;
export const inputFocusBorderColor = COLOR_SPECTRUM.blue60.color;

export const warningIconColor = COLOR_SPECTRUM.sunset60.color;
export const infoIconColor = COLOR_SPECTRUM.blue40.color;

export const dangerousButtonBorderColor = COLOR_SPECTRUM.red20.color;
export const dangerousButtonColor = COLOR_SPECTRUM.red30.color;
export const dangerousButtonHoverColor = COLOR_SPECTRUM.red40.color;
export const mutedButtonColor = COLOR_SPECTRUM.gray30.color;
export const mutedButtonHoverColor = COLOR_SPECTRUM.gray60.color;

export const errorBackgroundColor = '#FBFBFC';

export const workflowLabelColor = COLOR_SPECTRUM.gray25.color;
export const launchPlanLabelColor = COLOR_SPECTRUM.gray25.color;
export let flyteNavigation: FlyteNavigation | undefined = undefined;

export let statusColors = {
  FAILURE: COLOR_SPECTRUM.red20.color,
  RUNNING: COLOR_SPECTRUM.blue20.color,
  QUEUED: COLOR_SPECTRUM.amber20.color,
  SUCCESS: COLOR_SPECTRUM.mint20.color,
  SKIPPED: COLOR_SPECTRUM.sunset20.color,
  UNKNOWN: COLOR_SPECTRUM.gray20.color,
  WARNING: COLOR_SPECTRUM.yellow40.color,
  PAUSED: COLOR_SPECTRUM.amber30.color,
};

export let graphStatusColors = {
  FAILED: '#e90000',
  FAILING: '#f2a4ad',
  SUCCEEDED: '#37b789',
  ABORTED: '#be25d7',
  RUNNING: '#2892f4',
  QUEUED: '#dfd71b',
  PAUSED: '#f5a684',
  UNDEFINED: '#4a2839',
};

export type TaskColorMap = Record<TaskType, string>;
export const taskColors: TaskColorMap = {
  [TaskType.PYTHON]: '#7157D9',
  [TaskType.SPARK]: '#00B3A4',
  [TaskType.MPI]: '#00B3A4',
  [TaskType.BATCH_HIVE]: '#E1E8ED',
  [TaskType.DYNAMIC]: '#E1E8ED',
  [TaskType.HIVE]: '#E1E8ED',
  [TaskType.SIDECAR]: '#E1E8ED',
  [TaskType.UNKNOWN]: '#E1E8ED',
  [TaskType.WAITABLE]: '#E1E8ED',
  [TaskType.ARRAY]: '#E1E8ED',
  // plugins
  [TaskType.ARRAY_AWS]: '#E1E8ED',
  [TaskType.ARRAY_K8S]: '#E1E8ED',
};

export const bodyFontSize = '0.875rem';
export const smallFontSize = '0.75rem';

export const smallIconSize = '1.2rem';

export const updateConstants = (config: AppConfig | undefined) => {
  if (config) {
    bodyFontFamily = config.bodyFontFamily || bodyFontFamily;
    primaryColor = config.primaryColor || primaryColor;
    primaryLightColor = config.primaryLightColor || primaryLightColor;
    primaryDarkColor = config.primaryDarkColor || primaryDarkColor;
    primaryHighlightColor = config.primaryHighlightColor || primaryHighlightColor;
    interactiveTextColor = config.interactiveTextColor || interactiveTextColor;
    interactiveTextDisabledColor =
      config.interactiveTextDisabledColor || interactiveTextDisabledColor;
    interactiveTextBackgroundColor =
      config.interactiveTextBackgroundColor || interactiveTextBackgroundColor;

    statusColors = config.statusColors || statusColors;
    graphStatusColors = config.graphStatusColors || graphStatusColors;
    flyteNavigation = config.flyteNavigation || flyteNavigation;
  }
};
