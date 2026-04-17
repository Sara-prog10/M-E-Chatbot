
import React, { useState, useRef, useEffect } from 'react';
import { ChatMode, UploadedFile } from '../types';
import { CLIENT_NAME } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UploadModal } from './UploadModal';
import { GlobalWarningModal } from './GlobalWarningModal';

interface ChatInputBarProps {
  onSendMessage: (message: string, chatMode: ChatMode, fileIds?: string[]) => void;
  isLoading: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.GLOBAL);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isGlobalWarningModalOpen, setGlobalWarningModalOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<UploadedFile | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() || attachedFile) {
      onSendMessage(message, chatMode, attachedFile ? [attachedFile.fileId] : undefined);
      setMessage('');
      setAttachedFile(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  const handleAttachClick = () => {
    if (chatMode === ChatMode.GLOBAL) {
      setGlobalWarningModalOpen(true);
    } else {
      setUploadModalOpen(true);
    }
  };

  const handleWarningContinue = () => {
    setGlobalWarningModalOpen(false);
    setUploadModalOpen(true);
  };

  const onFileUploaded = (file: UploadedFile) => {
    setAttachedFile(file);
    setUploadModalOpen(false);
  };
  
  const startChatFromSuggestion = (prompt: string, file: UploadedFile) => {
    onSendMessage(prompt, chatMode, [file.fileId]);
    setUploadModalOpen(false);
  }

  return (
    <>
      <div className="w-full pb-4 pt-2">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-end gap-2 p-2">
            <button 
              onClick={handleAttachClick} 
              className="p-2 mb-[2px] rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-300 flex-shrink-0 transition-colors"
              title="Upload file"
            >
              <PlusIcon className="w-5 h-5 stroke-2" />
            </button>
            
            <div className="relative mb-[4px] flex items-center border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0 cursor-pointer group">
              {chatMode === ChatMode.COMPANY ? (
                <BuildingIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0" />
              ) : (
                <GlobeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0" />
              )}
              <select 
                  value={chatMode} 
                  onChange={e => setChatMode(e.target.value as ChatMode)} 
                  className="appearance-none bg-transparent outline-none pr-5 font-medium text-sm text-gray-700 dark:text-gray-200 cursor-pointer z-10 w-full disabled:cursor-not-allowed"
              >
                  <option value={ChatMode.GLOBAL}>Global</option>
                  <option value={ChatMode.COMPANY}>Company</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-2 pointer-events-none group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            </div>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything about ${CLIENT_NAME}...`}
              className="flex-grow bg-transparent border-transparent py-2 px-2 text-[15px] resize-none focus:outline-none focus:ring-0 leading-relaxed text-gray-800 dark:text-gray-100 self-center max-h-[200px]"
              rows={1}
            />
            
            <button 
              onClick={handleSend} 
              disabled={isLoading || (!message.trim() && !attachedFile)} 
              className="p-2 w-9 h-9 flex-shrink-0 mb-[6px] mr-[2px] bg-[#d3def2] cursor-pointer text-[#4e6a8e] rounded-full hover:bg-[#c2d0eb] disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 flex items-center justify-center transition-colors"
            >
              <ArrowUpIcon className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>
          <div className="text-center mt-3 text-[11px] leading-tight text-gray-500 dark:text-gray-400 font-medium opacity-80 max-w-3xl mx-auto">
            IMPORTANT: Always verify the generated response before use. {CLIENT_NAME}-GPT may give incomplete / incorrect answers.
            Its general information base is updated as of March 2026  while documents in the knowledge base may not be updated.
          </div>
        </div>
      </div>
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        onFileUploaded={onFileUploaded}
        onPromptSelect={startChatFromSuggestion}
      />
      <GlobalWarningModal
        isOpen={isGlobalWarningModalOpen}
        onClose={() => setGlobalWarningModalOpen(false)}
        onContinue={handleWarningContinue}
      />
    </>
  );
};
