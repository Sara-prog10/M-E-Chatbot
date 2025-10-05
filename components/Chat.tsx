
import React, { useState, useRef, useEffect } from 'react';
import { ChatMode, Message } from '../types';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import DocumentSummarizer from './DocumentSummarizer';
import { generateGlobalResponse, generateCompanyResponse } from '../services/geminiService';
import { Theme } from '../App';
import DownloadIcon from './icons/DownloadIcon';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface ChatProps {
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Chat: React.FC<ChatProps> = ({ onLogout, theme, toggleTheme }) => {
  const [mode, setMode] = useState<ChatMode>(ChatMode.COMPANY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate a unique session ID when the chat component mounts.
    setSessionId(crypto.randomUUID().replace(/-/g, ''));
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let botResponseText = '';
    if (mode === ChatMode.COMPANY) {
        botResponseText = await generateCompanyResponse(text);
    } else if (mode === ChatMode.GLOBAL) {
        botResponseText = await generateGlobalResponse(text, sessionId, 'Admin');
    }

    const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: mode,
    };

    setIsLoading(false);
    setMessages((prev) => [...prev, botMessage]);
  };

  const handleAttachClick = () => {
    setMode(ChatMode.SUMMARIZER);
  };

  const handleDownloadChat = async () => {
    const filteredMessages = messages.filter(msg => msg.mode === mode);
    if (filteredMessages.length === 0) return;

    try {
      const paragraphs = filteredMessages.flatMap(msg => {
        const sender = msg.sender === 'user' ? 'You' : 'Bot';
        
        const senderLine = new Paragraph({
          children: [
            new TextRun({
              text: `${sender} (${msg.timestamp}): `,
              bold: true,
            }),
          ],
        });
        
        const messageLines = msg.text.split('\n').map(line => new Paragraph({
          children: [new TextRun(line)]
        }));

        const spacing = new Paragraph({ children: [new TextRun('')] });
        
        return [senderLine, ...messageLines, spacing];
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Chat History: ${mode}`,
                  bold: true,
                  size: 28, // 14pt
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun('')] }),
            ...paragraphs,
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MEChat-${mode}-${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Error generating .docx:", e);
        alert('An error occurred while generating the document.');
    }
  };

  const currentView = () => {
    if (mode === ChatMode.SUMMARIZER) {
      return <DocumentSummarizer fileInputRef={fileInputRef} />;
    }
    const filteredMessages = messages.filter(
      (msg) => msg.mode === mode
    );
    return (
      <>
        <header className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="px-5 py-2 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md rounded-full shadow-lg border border-border/50 dark:border-dark-border/50">
                <h2 className="text-md font-semibold text-primary dark:text-dark-primary tracking-wide">{mode}</h2>
            </div>
        </header>
        <ChatWindow messages={filteredMessages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} onAttachClick={handleAttachClick} />
      </>
    );
  };

  const filteredMessages = messages.filter(msg => msg.mode === mode);

  return (
    <div className="flex h-screen bg-background dark:bg-dark-background text-primary dark:text-dark-primary">
      <Sidebar currentMode={mode} setMode={setMode} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />
      <main className="relative flex flex-col flex-1 h-full overflow-hidden">
        {(mode === ChatMode.COMPANY || mode === ChatMode.GLOBAL) && (
            <button
                onClick={handleDownloadChat}
                disabled={filteredMessages.length === 0}
                className="absolute top-5 right-6 z-10 flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary dark:text-dark-secondary rounded-lg hover:bg-gray-200/60 dark:hover:bg-dark-bot-bubble disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Download Chat History"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>Download</span>
            </button>
        )}
        {currentView()}
      </main>
    </div>
  );
};

export default Chat;