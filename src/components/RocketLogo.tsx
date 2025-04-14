
import React from 'react';

interface RocketLogoProps {
  className?: string;
}

export const RocketLogo: React.FC<RocketLogoProps> = ({ className = "h-6 w-6" }) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="animate-rocket-fall"
      >
        <path 
          d="M50 10C50 10 40 25 40 50C40 75 50 90 50 90C50 90 60 75 60 50C60 25 50 10 50 10Z" 
          fill="white"
          stroke="white"
          strokeWidth="2"
        />
        <path 
          d="M30 40C30 40 40 45 50 45C60 45 70 40 70 40C70 40 60 60 50 60C40 60 30 40 30 40Z" 
          fill="white"
          stroke="white"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="5" fill="#111827" />
        <path 
          d="M45 20C45 20 40 30 40 40C40 50 45 55 45 55C45 55 40 45 40 35C40 25 45 20 45 20Z" 
          fill="#111827"
        />
      </svg>
      <div className="rocket-flames absolute w-full h-24 -bottom-20 left-1/2 -translate-x-1/2">
        <div className="relative w-full h-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-gradient-to-b from-yellow-300 via-orange-500 to-transparent opacity-80 animate-pulse rounded-b-full blur-sm"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-3/4 bg-gradient-to-b from-white via-yellow-300 to-transparent opacity-70 animate-pulse rounded-b-full blur-sm"></div>
        </div>
      </div>
    </div>
  );
};
