import React, { SVGProps } from 'react';

export const HomeLogo = (props: SVGProps<SVGSVGElement>): JSX.Element => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.5 19.5H9.25V13.25H14.75V19.5H18.5V9.75L12 4.875L5.5 9.75V19.5ZM4 21V9L12 3L20 9V21H13.25V14.75H10.75V21H4Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default HomeLogo;
