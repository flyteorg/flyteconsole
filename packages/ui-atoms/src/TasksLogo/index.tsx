import React, { SVGProps } from 'react';

export const TasksLogo = (props: SVGProps<SVGSVGElement>): JSX.Element => {
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
        d="M10.85 17.625L16.575 11.9L15.6 10.925L10.85 15.675L8.275 13.1L7.3 14.075L10.85 17.625ZM5.5 22C5.1 22 4.75 21.85 4.45 21.55C4.15 21.25 4 20.9 4 20.5V3.5C4 3.1 4.15 2.75 4.45 2.45C4.75 2.15 5.1 2 5.5 2H14.525L20 7.475V20.5C20 20.9 19.85 21.25 19.55 21.55C19.25 21.85 18.9 22 18.5 22H5.5ZM13.775 8.15V3.5H5.5V20.5H18.5V8.15H13.775Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default TasksLogo;
