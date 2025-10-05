import React from 'react';
import { Message } from '../types';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    // User messages now adopt the previous style of the bot messages for a consistent, neutral look.
    return (
      <div className={`flex items-start gap-4 animate-fadeIn justify-end`}>
        <div className={`flex flex-col max-w-xl items-end`}>
          <div
            className={`px-4 py-3 rounded-2xl bg-bot-bubble dark:bg-dark-bot-bubble text-primary dark:text-dark-primary rounded-br-lg border border-border dark:border-dark-border`}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-secondary dark:text-dark-secondary">{message.timestamp}</span>
          </div>
        </div>

        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sidebar dark:bg-dark-sidebar flex items-center justify-center border border-border dark:border-dark-border">
          <UserIcon className="w-5 h-5 text-secondary dark:text-dark-secondary" />
        </div>
      </div>
    );
  }
  
  // Bot messages are now displayed as plain text without a containing bubble for a more direct, less stylized appearance.
  return (
    <div className={`flex items-start gap-4 animate-fadeIn`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sidebar dark:bg-dark-sidebar flex items-center justify-center border border-border dark:border-dark-border">
        <BotIcon className="w-5 h-5 text-secondary dark:text-dark-secondary" />
      </div>
      
      <div className={`flex flex-col max-w-xl items-start pt-1.5`}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary dark:text-dark-primary">{message.text}</p>
        <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-secondary dark:text-dark-secondary">{message.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;