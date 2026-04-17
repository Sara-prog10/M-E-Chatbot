
import React from 'react';
import type { ChatSession, ChatMode } from '../types';
import { MessageAuthor } from '../types';
import { ChatInputBar } from './ChatInputBar';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { StarIcon } from './icons/StarIcon';
import { FileIcon } from './icons/FileIcon';

interface ChatWindowProps {
  session: ChatSession;
  onSendMessage: (message: string, chatMode: ChatMode, fileIds?: string[]) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ session, onSendMessage, isLoading }) => {
  const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {session.messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-4 ${message.author === MessageAuthor.USER ? 'justify-end' : ''}`}>
              {message.author === MessageAuthor.AI && (
                 <img className="h-8 w-8 rounded-full shadow-sm" src="https://picsum.photos/seed/ai/100" alt="AI Avatar" />
              )}
              <div className={`rounded-2xl px-5 py-3.5 max-w-lg shadow-sm ${
                  message.author === MessageAuthor.USER
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</div>
                {message.author === MessageAuthor.AI && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 border-t dark:border-gray-600 pt-3">
                        <h4 className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources</h4>
                        <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, index) => (
                                <button key={`${source.fileId}-${index}`} className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <FileIcon className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{source.fileId} <span className="text-gray-400 font-normal">p.{source.page}</span></span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {message.author === MessageAuthor.AI && (
                    <div className="flex items-center gap-1.5 mt-3 pt-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><ThumbsUpIcon className="h-4 w-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><ThumbsDownIcon className="h-4 w-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"><StarIcon className="h-4 w-4" /></button>
                    </div>
                 )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <img className="h-8 w-8 rounded-full shadow-sm" src="https://picsum.photos/seed/ai/100" alt="AI Avatar" />
                <div className="rounded-2xl px-5 py-4 max-w-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm flex items-center h-[52px]">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>
      <div className="w-full">
        <ChatInputBar onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
