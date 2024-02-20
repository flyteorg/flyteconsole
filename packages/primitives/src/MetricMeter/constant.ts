import { muiTheme } from '@clients/theme/Theme/muiTheme';

interface ColorValue {
  background: string;
  fill: string;
}

export type ColorSchema = 'yellow' | 'blue';

export const colorValues: { [key in ColorSchema]: ColorValue } = {
  yellow: {
    background: muiTheme.palette.common.primary.yellowLight2,
    fill: muiTheme.palette.common.primary.yellow,
  },
  // blue color is temporary for testing in story book, need to replace the values in the future
  blue: {
    background: muiTheme.palette.common.primary.lightBlue,
    fill: muiTheme.palette.common.primary.blue,
  },
};
