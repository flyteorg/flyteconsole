type StatusColor = {
  FAILURE: string;
  RUNNING: string;
  QUEUED: string;
  SUCCESS: string;
  SKIPPED: string;
  UNKNOWN: string;
  WARNING: string;
  PAUSED: string;
};

type GraphStatusColor = {
  FAILED: string;
  FAILING: string;
  SUCCEEDED: string;
  ABORTED: string;
  RUNNING: string;
  QUEUED: string;
  PAUSED: string;
  UNDEFINED: string;
};

export interface FlyteNavItem {
  title: string;
  url: string;
}

export interface FlyteNavigation {
  color?: string;
  background?: string;
  console?: string;
  items: FlyteNavItem[];
}

export type AppConfig = {
  bodyFontFamily?: string;
  primaryColor?: string;
  primaryLightColor?: string;
  primaryDarkColor?: string;
  primaryHighlightColor?: string;
  interactiveTextColor?: string;
  interactiveTextDisabledColor?: string;
  interactiveTextBackgroundColor?: string;
  inputFocusBorderColor?: string;
  statusColors?: StatusColor;
  graphStatusColors?: GraphStatusColor;
  flyteNavigation?: FlyteNavigation;
};
