import React, { useState } from 'react';
import SendIcon from './icons/SendIcon';
import AttachmentIcon from './icons/AttachmentIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onAttachClick: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onAttachClick }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <div className="p-4 bg-transparent">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button
            type="button"
            onClick={onAttachClick}
            className="absolute left-3 p-2 text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary rounded-full hover:bg-gray-200 dark:hover:bg-dark-bot-bubble transition-colors"
          >
            <AttachmentIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full py-3 pl-12 pr-14 border border-border dark:border-dark-border bg-sidebar dark:bg-dark-sidebar rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/50 dark:focus:ring-dark-secondary/50 transition-shadow text-sm"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 p-2 bg-primary dark:bg-dark-primary text-background dark:text-dark-background rounded-lg hover:opacity-90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            disabled={!text.trim()}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;