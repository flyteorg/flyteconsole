import { InterpreterOptions } from 'xstate';
import { env } from './environment';

export const detailsPanelWidth = 432;

export const labels = {
  moreOptionsButton: 'Display more options',
  moreOptionsMenu: 'More options menu',
};

export const defaultStateMachineConfig: Partial<InterpreterOptions> = {
  devTools: env.NODE_ENV === 'development',
};

export const barChartColors = {
  default: '#e5e5e5',
  success: '#78dfb1',
  failure: '#f2a4ad',
};
