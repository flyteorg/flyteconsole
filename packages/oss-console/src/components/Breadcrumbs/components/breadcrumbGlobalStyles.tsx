import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { COLOR_SPECTRUM as ColorSpectrum } from '@clients/theme/CommonStyles/colorSpectrum';

export const BreadcrumbGlobalStyles = () => {
  return (
    <GlobalStyles
      styles={() => ({
        '.breadcrumbs': {
          '& *': {
            fontFamily: 'Mulish, Helvetica, Arial, sans-serif !important',
          },
          '& h1': {
            fontStyle: 'normal',
            fontWeight: 500,
          },
          '& .breadcrumbs-current-page-container .breadcrumb-form-control-more-button': {
            marginLeft: '4px',
          },
          '& .breadcrumb-form-control-more-button': {
            width: '20px',
            height: '20px',
            borderRadius: '5px',
            color: ColorSpectrum.indigo80.color,
            '&:hover': {
              border: `${ColorSpectrum.indigo80.color} 2px solid`,
              '&:active': {
                color: 'white',
                background: ColorSpectrum.indigo80.color,
              },
            },
          },
          '& .c--MuiTouchRipple-root': {
            display: 'none',
          },
          '& button': {
            minWidth: '0',
          },
          '& button.hidden': {
            display: 'none',
          },
        },
        // Global to accomidate targeting popover
        '.breadcrumb-form-control-popover': {
          '& .breadcrumb-form-control-popover-list-item': {
            paddingTop: 0,
            paddingBottom: 0,
            '& .c--MuiTouchRipple-root': {
              display: 'none',
            },
          },
          '& a': {
            fontFamily: 'Mulish, Helvetica, Arial, sans-serif !important',
            fontWeight: '400 !important',
          },
          '& button': {
            fontFamily: 'Mulish, Helvetica, Arial, sans-serif !important',
            fontWeight: '400 !important',
          },
        },
      })}
    />
  );
};
