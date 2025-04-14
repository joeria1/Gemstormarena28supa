
import React from 'react';

interface HorseIconProps {
  className?: string;
  color?: string;
  size?: number;
}

const HorseIcon: React.FC<HorseIconProps> = ({ className, color = "currentColor", size }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
    >
      <path d="M21 4v6m-9-6v6m-3 10a6 6 0 0 1-6-6c0-4 3-6 3-6h12s3 2 3 6a6 6 0 0 1-6 6h-6Z"/>
      <path d="M21 4c-2.2 0-5.9 2-8.5 2S5 4 3 4l3 6L3 8c0 4 4.2 6 5 8l4-6 2 4c2.2 0 5-2 5-6Z"/>
    </svg>
  );
};

export default HorseIcon;
