import React from 'react';
import BotIcon from './icons/BotIcon';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4 animate-fadeIn">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sidebar dark:bg-dark-sidebar flex items-center justify-center border border-border dark:border-dark-border">
        <BotIcon className="w-5 h-5 text-secondary dark:text-dark-secondary" />
      </div>
      <div className="flex flex-col items-start pt-3.5">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2 h-2 bg-secondary dark:bg-dark-secondary rounded-full animate-bounce-slow [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-secondary dark:bg-dark-secondary rounded-full animate-bounce-slow [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-secondary dark:bg-dark-secondary rounded-full animate-bounce-slow"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;