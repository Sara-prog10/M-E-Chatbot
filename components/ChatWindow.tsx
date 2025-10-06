import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 pt-20 bg-background dark:bg-dark-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatWindow;