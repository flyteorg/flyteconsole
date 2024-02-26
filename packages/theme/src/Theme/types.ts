import React from 'react';

declare module '@mui/material/styles/createPalette' {
  interface CommonColors {
    primary: {
      white: string;
      black: string;
      union500: string;
      union400: string;
      union300: string;
      union200: string;
      union100: string;
      yellow: string;
      yellowLight1: string;
      yellowLight2: string;
      yellowDark: string;
      purple: string;
      lightBlue: string;
      blue: string;
    };
    brand: {
      cloud: string;
    };
    state: {
      default: string;
      succeeded: string;
      succeeding: string;
      aborted: string;
      aborting: string;
      failed: string;
      failing: string;
      running: string;
      dynamicrunning: string;
      queued: string;
      undefined: string;
      recovered: string;
      notrun: string;
      nested: string;
      timedout: string;
      paused: string;
      skipped: string;
      initializing: string;
      waiting: string;
    };
    gpu: {
      [key: number]: string;
    };
    blue: {
      [key: number]: string;
    };
    grays: {
      [key: number]: string;
    };

    citron: {
      [key: number]: string;
    };
    graph: {
      background: string;
      breadActiveColor: string;
      breadInactiveColor: string;
    };
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    code: React.CSSProperties;
    label: React.CSSProperties;
    stats: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    code: React.CSSProperties;
    label: React.CSSProperties;
    stats: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true;
    label: true;
    stats: true;
  }
}

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    block: true;
  }
}
