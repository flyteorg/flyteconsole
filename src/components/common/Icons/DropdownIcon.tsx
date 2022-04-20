import * as React from 'react';
import { IconProps } from './interface';

export const DropdownIcon: React.FC<IconProps> = ({ size = 17, className, onClick }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      onClick={onClick}
    >
      <rect
        x="3.09234"
        y="3.07989"
        width="10.7556"
        height="1.09875"
        stroke="white"
        strokeWidth="1.09875"
      />
      <rect
        x="3.09234"
        y="7.63995"
        width="10.7556"
        height="1.09875"
        stroke="white"
        strokeWidth="1.09875"
      />
      <rect
        x="3.09234"
        y="12.2003"
        width="10.7556"
        height="1.09875"
        stroke="white"
        strokeWidth="1.09875"
      />
    </svg>
  );
};
