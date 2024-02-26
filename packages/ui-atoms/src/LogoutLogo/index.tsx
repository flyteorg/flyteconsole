import React, { SVGProps } from 'react';

/** Renders the Flyte glyph/text logo */
export const LogoutLogo = (props: SVGProps<SVGSVGElement>): JSX.Element => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="inherit"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"> */}
      <path d="M5.47505 3H13.575C14.0524 3 14.5103 3.18964 14.8478 3.52721C15.1854 3.86477 15.375 4.32261 15.375 4.8V6.6H13.575V4.8H5.47505V19.2H13.575V17.4H15.375V19.2C15.375 19.6774 15.1854 20.1352 14.8478 20.4728C14.5103 20.8104 14.0524 21 13.575 21H5.47505C4.99766 21 4.53982 20.8104 4.20226 20.4728C3.86469 20.1352 3.67505 19.6774 3.67505 19.2V4.8C3.67505 4.32261 3.86469 3.86477 4.20226 3.52721C4.53982 3.18964 4.99766 3 5.47505 3Z" />
      <path d="M14.556 15.2309L15.825 16.4999L20.325 11.9999L15.825 7.49991L14.556 8.76891L16.878 11.0999H8.17505V12.8999H16.878L14.556 15.2309Z" />
    </svg>
  );
};

export default LogoutLogo;
