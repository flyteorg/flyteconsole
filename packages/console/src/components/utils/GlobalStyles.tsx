import React, { useEffect } from 'react';
import { injectGlobal } from 'emotion';

const GlobalStyles = () => {
  useEffect(() => {
    injectGlobal(`
      body {
        overscroll-behavior: none;
      }
      .sr-only {
        display: none;
      }
    `);
  }, []);
  return <></>;
};

export default GlobalStyles;
