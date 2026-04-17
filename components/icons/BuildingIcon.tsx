import React from 'react';

export const BuildingIcon = ({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    {...props}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="2" />
    <line x1="15" y1="22" x2="15" y2="2" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="10" x2="20" y2="10" />
    <line x1="4" y1="14" x2="20" y2="14" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);
