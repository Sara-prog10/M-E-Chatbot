import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, SendIcon, ChevronDownIcon, XIcon, DocumentIcon, BuildingIcon, GlobeIcon } from './icons';

interface ChatInputBarProps {
  onSendMessage: (message: string, chatMode: 'company' | 'global', file?: File) => void;
  isSending: boolean;
  clientName: string;
  promptToPaste: string | null;
  onPasteComplete: () => void;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, isSending, clientName, promptToPaste, onPasteComplete }) => {
  const [inputValue, setInputValue] = useState('');
  const [chatMode, setChatMode] = useState<'company' | 'global'>('company');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((inputValue.trim() || attachedFile) && !isSending) {
      onSendMessage(inputValue, chatMode, attachedFile ?? undefined);
      setInputValue('');
      handleRemoveFile();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
    // Reset file input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`; // Set to content height
    }
  }, [inputValue]);

  useEffect(() => {
    if (promptToPaste) {
        setInputValue(promptToPaste);
        textareaRef.current?.focus();
        onPasteComplete();
    }
  }, [promptToPaste, onPasteComplete]);

  return (
    <div className="max-w-4xl mx-auto">
      {attachedFile && (
        <div className="mb-2 flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0">
            <DocumentIcon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{attachedFile.name}</span>
          </div>
          <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-300 dark:border-slate-600 p-2 flex items-end gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button onClick={handleAttachClick} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 self-center">
          <PlusIcon />
        </button>

        <div className="relative self-center">
          <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm">
            {chatMode === 'company' ? <BuildingIcon /> : <GlobeIcon />}
            <span>{chatMode === 'company' ? 'Company' : 'Global'}</span>
            <ChevronDownIcon />
          </button>
          {isDropdownOpen && (
            <div className="absolute bottom-full mb-2 w-32 bg-white dark:bg-slate-700 rounded-md shadow-lg border border-slate-200 dark:border-slate-600 z-10">
              <button onClick={() => { setChatMode('company'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">Company</button>
              <button onClick={() => { setChatMode('global'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">Global</button>
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask anything about ${clientName}...`}
          className="flex-1 bg-transparent resize-none border-none focus:ring-0 p-2 max-h-48 text-slate-800 dark:text-slate-200 placeholder-slate-400"
          rows={1}
          disabled={isSending}
        />

        <button
          onClick={handleSend}
          disabled={isSending || (!inputValue.trim() && !attachedFile)}
          className="p-2 rounded-full bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800 hover:bg-slate-600 dark:hover:bg-white disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 px-4">
        IMPORTANT: Always verify the generated response before use. {clientName}-GPT may give incomplete / incorrect answers. Its general information base is updated as of Jan 2025 while documents in the knowledge base may not be updated.
      </p>
    </div>
  );
};

export default ChatInputBar;