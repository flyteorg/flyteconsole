import React, { useEffect } from 'react';
import { injectGlobal } from '@emotion/css';
import { palette } from '@clients/theme/Theme/muiTheme';
import keys from 'lodash/keys';
import { type CSSProperties } from '@mui/styles/withStyles/withStyles';

const commonProperties = ['background', 'border', 'color'];
export type TargetProperty = (typeof commonProperties)[number];

const commonPropsToCssProps: { [key in TargetProperty]: keyof CSSProperties } = {
  background: 'background-color',
  border: 'border-color',
  color: 'color',
  fill: 'fill',
};

export const stateColors = commonProperties
  .map((cssProp) => {
    return keys(palette.state).map((stateName) => {
      const cssPropName = commonPropsToCssProps[cssProp];
      return `
    .${cssProp}-status-${stateName} {
      ${cssPropName}: ${palette.state[stateName]} !important
    }
  `;
    });
  })
  .flat();

const GlobalStyles = () => {
  useEffect(() => {
    injectGlobal(`
      body > div {
        overscroll-behavior: none;
      }
      #root {
        height: 100%;
      }
      .sr-only {
        display: none;
      }
      .pointer {
        cursor: pointer;
      }

      ${stateColors}
    `);
  }, []);
  return <></>;
};

export default GlobalStyles;
