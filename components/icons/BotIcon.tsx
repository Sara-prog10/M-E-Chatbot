
import React from 'react';

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="12" rx="2"></rect>
    <path d="M7 15h0M12 15h0M17 15h0"></path>
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export default BotIcon;
