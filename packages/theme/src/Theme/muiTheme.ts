import './types';
import { createTheme, type ThemeOptions } from '@mui/material/styles';

export const palette = {
  primary: {
    white: '#ffffff',
    black: '#000000',
    flyte: '#2B1B81',
    union500: '#43474e',
    union400: '#67696D',
    union300: '#C1C3C6',
    union200: '#E6E7E8',
    union100: '#f2f3f3',
    yellow: '#fcb51f',
    yellowLight1: '#F9D48E',
    yellowLight2: '#FFF6E4',
    yellowDark: '#E79D00',
    purple: '#541dff',
    lightBlue: '#bfe6ff',
    blue: '#009dff',
  },
  flyteNav: {
    divider: '#FFFFFF',
    icon_primary: 'rgba(255, 255, 255, 1)',
    icon_hover: 'rgba(255, 255, 255, .08)',
    icon_selected: 'rgba(255, 255, 255, .16)',
    icon_focus: 'rgba(255, 255, 255, .12)',
  },
  brand: {
    cloud: '#019ADA',
  },
  state: {
    default: '#e5e5e5',
    succeeded: '#77C332',
    succeeding: '#C0D765',
    aborted: '#C91DFF',
    aborting: '#CE90FF',
    failed: '#EE678E',
    failing: '#FC8D14',
    running: '#456FFF',
    dynamicrunning: '#456FFF',
    queued: '#F2840C',
    undefined: '#EBDBC8',
    recovered: '#FFE9B9',
    notrun: '#E6E7E8',
    nested: '#AAAAAA',
    timedout: '#FEABAB',
    paused: '#FCB51D',
    skipped: '#B6B6B6',
    // todo: special cases https://www.figma.com/file/49B9RGzHBX12aKzZbNjuFP/01-Design-System-for-Union-Cloud?type=design&node-id=6068-13885&mode=design&t=FBnnHgqlGDeqZwr4-0
    initializing: '#E6E7E8',
    waiting: '#E6E7E8',
  },
  gpu: {
    0: '#FCB51F',
    1: '#FF901E',
    2: '#FF6137',
    3: '#FF0057',
    4: '#FF007D',
    5: '#FD00A8',
    6: '#C700D6',
    7: '#541DFF',
  },
  blue: {
    1: '#F4F6FC',
    2: '#C3CEF3',
    3: '#9EAEE8',
    5: '#5D75CE',
    6: '#4259B1',
    7: '#283C8C',
    8: '#152564',
    9: '#051238',
  },

  grays: {
    10: '#e8e8e8',
    20: '#CCCBCA',
    30: '#B6B6B6',
    40: '#67696D',
    80: '#333436',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  citron: {
    90: '#82B428',
  },

  yellow: {
    60: '#FFC002',
  },

  graph: {
    background: '#666666',
    breadActiveColor: '#8B37FF',
    breadInactiveColor: '#000000',
  },
};

export const boxShadow = {
  circleText: '0px 4.5px 9.3px rgb(0 0 0 / 12%)',
};

export const constant = {
  border: `1px solid ${palette.primary?.union200}`,
  borderOnDark: `1px solid ${palette.primary.union400}`,
  borderRadiusXxs: 2,
  borderRadiusXs: 4,
  borderRadiusS: 8,
  borderRadiusM: 12,
  borderRadiusL: 16,
  minWidth: 320,
  maxWidth: 1536,
};

const breakpoints = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 };

export const cloudThemeOptions: ThemeOptions = {
  spacing: 8,
  breakpoints: {
    values: breakpoints,
  },
  palette: {
    primary: {
      main: palette.grays[80],
      dark: palette.primary.yellow, // hover
      contrastText: palette.primary.white,
    },
    secondary: {
      main: palette.primary.yellowDark,
    },
    info: {
      main: palette.primary.union400,
    },
    background: {
      default: palette.primary.union100,
      paper: palette.primary.white,
    },
    text: {
      primary: palette.primary.black,
      secondary: palette.primary.union400,
    },
    action: {
      selected: palette.primary.yellow,
      hoverOpacity: 0.15,
    },
    divider: palette.divider,
    common: { ...palette },
  },
  shape: {
    borderRadius: constant.borderRadiusXs,
  },
  components: {
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: palette.primary.white,
          '&.Mui-disabled': {
            '& + .MuiSwitch-track': {
              opacity: 0.7,
              backgroundColor: palette.grays[10],
            },
          },
          '&.Mui-checked': {
            color: palette.primary.white,
            '& + .MuiSwitch-track': {
              opacity: 0.7,
              backgroundColor: palette.citron[90],
            },
          },
          '& + .MuiSwitch-track': {
            color: palette.grays[20],
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: {
          height: '100%',
          backgroundColor: palette.primary.white,
          WebkitFontSmoothing: 'subpixel-antialiased',
        },
      },
    },
    MuiButton: {
      variants: [
        /** SIZES */
        {
          props: { size: 'large' },
          style: {
            padding: '10px 22px',
            fontSize: '18px',
            lineHeight: '24px',
            fontWeight: 600,
          },
        },
        {
          props: { size: 'medium' },
          style: {
            padding: '6px 16px',
            fontSize: '16px',
            lineHeight: '22px',
            fontWeight: 400,
          },
        },
        {
          props: { size: 'small' },
          style: {
            padding: '4px 10px',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 400,
          },
        },
        /** VARIANTS */
        {
          props: { color: 'primary', variant: 'contained' },
          style: {
            color: palette.primary.white,
            backgroundColor: palette.blue[8],
            '&:hover': {
              backgroundColor: palette.blue[9],
            },
            '&:disabled': {
              backgroundColor: palette.grays[20],
            },
          },
        },
        {
          props: { color: 'primary', variant: 'outlined' },
          style: {
            color: palette.blue[7],
            borderColor: palette.blue[7],
            backgroundColor: palette.primary.white,
            '&:hover': {
              borderColor: palette.blue[9],
              backgroundColor: palette.blue[2],
            },
            '&:disabled': {
              backgroundColor: palette.grays[20],
            },
          },
        },
        {
          props: { color: 'primary', variant: 'text' },
          style: {
            color: palette.blue[7],
            '&:hover': {
              backgroundColor: palette.blue[2],
            },
            '&:disabled': {
              color: palette.grays[20],
            },
          },
        },
      ],
      styleOverrides: {
        textPrimary: palette.blue[7],
        root: {
          borderRadius: constant.borderRadiusXs,
          textTransform: 'none',
          color: palette.blue[7],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          padding: '0 12px',
          '& input': {
            padding: '12px 0',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: palette.grays[40],
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: palette.grays[40],
          fontSize: '14px !important',
          '&:checked': {
            color: `${palette.blue[8]} !important`,
          },
        },
      },
    },
    MuiLink: {
      defaultProps: {
        color: palette.blue[5],
      },
      styleOverrides: {
        root: {
          fontSize: '14px',
        },
      },
    },
    MuiCard: {
      variants: [
        {
          props: { variant: 'outlined' },
          style: {
            borderRadius: constant.borderRadiusM,
          },
        },
        {
          props: { variant: 'block' },
          style: {
            borderRadius: constant.borderRadiusL,
            border: 0,
          },
        },
      ],
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          whiteSpace: 'pre-wrap',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: palette.blue[8],
        },
        tooltip: {
          backgroundColor: palette.blue[8],
          color: palette.primary.white,
          fontFamily: 'Roboto Condensed',
          letterSpacing: '0.1px',
          fontWeight: 300,
          fontSize: '14px',
          lineheight: '20px',
          textAlign: 'center',
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& tr:hover': {
            transition: 'background-color 0.2s ease',
            backgroundColor: palette.blue[1],
          },
          '& tr.hover': {
            transition: 'background-color 0.2s ease',
            backgroundColor: palette.blue[1],
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: palette.primary.black,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          maxWidth: '200px',
          '& > button, & > a, & > span': {
            // <a/> will not reflect size of truncated children
            // havoc for tooltips
            display: 'block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          },
          'a, p': {
            fontSize: '14px',
          },
          '& h6': {
            fontSize: '12px',
          },
          '& a.MuiButton-textInfo': {
            color: palette.primary.black,
            padding: '4px 8px',
            margin: '-4px -8px',
            display: 'inline',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    // Style table header cell
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': {
            textTransform: 'uppercase',
            color: palette.grays[40],
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            /* Title 3 */
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '20px',

            borderTop: `1px solid ${palette.divider}`,
            borderBottom: `1px solid ${palette.divider}`,
            paddingTop: '6px',
            paddingBottom: '6px',
            background: palette.primary.white,
          },
          '& h3': {
            color: palette.primary.black,
            textTransform: 'none',
            fontSize: '16px',
            lineHeight: '32px',
            fontWeight: 500,
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          minHeight: '32px',
          height: '32px',
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '4px',
          backgroundColor: palette.yellow[60],
        },
      },
    },
  },
  typography: {
    fontFamily: ['Mulish', 'Roboto', 'sans-serif'].join(','),
    h1: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 500,
    },
    h2: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 500,
    },
    h3: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '16px',
      lineHeight: '32px',
      fontWeight: 500,
    },
    h4: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '16px',
      lineHeight: '28px',
      fontWeight: 500,
    },
    h5: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '16px',
      lineHeight: '22px',
      fontWeight: 700,
    },
    h6: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '14px',
      lineHeight: '24px',
      fontWeight: 400,
    },
    body2: {
      fontFamily: 'Mulish, sans-serif',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
    },
    code: {
      fontFamily: '"Space Mono", monospace',
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 400,
    },
    label: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
    },
    stats: {
      fontSize: '10px',
      lineHeight: '13px',
      fontWeight: 500,
    },
    caption: {
      fontSize: '10px',
      lineHeight: '13px',
      fontWeight: 300,
    },
  },
};

export const muiTheme = createTheme(cloudThemeOptions);

export default muiTheme;
