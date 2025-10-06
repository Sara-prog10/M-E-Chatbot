import React, { useRef, useEffect } from 'react';
import type { ChatSession, Message, Source } from '../types';
import { UserIcon, BotIcon, ThumbsUpIcon, ThumbsDownIcon, BookmarkIcon as FavoriteIcon, DocumentIcon, DownloadIcon } from './icons';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface ChatWindowProps {
  session: ChatSession;
  isSending: boolean;
}

const SourceCitation: React.FC<{ source: Source }> = ({ source }) => (
    <button className="inline-flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">
        <DocumentIcon />
        <span>{source.fileId} (p. {source.page})</span>
    </button>
);

// Simple Markdown Renderer to handle bold text
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const paragraphs = (text || '').split('\n');
  
    return (
      <>
        {paragraphs.map((paragraph, pIndex) => (
          <p key={pIndex}>
            {paragraph.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        ))}
      </>
    );
};


const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
        <div className={`flex items-start gap-3 py-4 px-4 md:px-0 ${isUser ? 'justify-end' : 'justify-start'}`}>
            
            {/* Avatar/Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isUser 
                ? 'border border-slate-300 dark:border-slate-600' 
                : 'bg-slate-200 dark:bg-slate-700'
            } ${isUser ? 'order-2' : 'order-1'}`}>
                {isUser ? <UserIcon /> : <BotIcon />}
            </div>

            {/* Message Content Wrapper */}
            <div className={`flex flex-col gap-1 max-w-xl lg:max-w-2xl ${isUser ? 'order-1 items-end' : 'order-2 items-start'}`}>
                {/* The actual bubble with background and padding */}
                <div className={`rounded-lg px-3 py-2 ${isUser ? 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    
                    {isUser && message.attachment?.type === 'image' && (
                        <img 
                            src={message.attachment.url} 
                            alt={message.attachment.name}
                            className="max-w-xs max-h-48 rounded-md mb-2 object-cover"
                        />
                    )}
                    
                    {isUser && message.attachment?.type === 'other' && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-slate-200 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600">
                            <DocumentIcon className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{message.attachment.name}</span>
                        </div>
                    )}

                    {message.content && (
                         <div className={`prose prose-sm max-w-none prose-p:my-2 ${isUser ? 'dark:prose-p:text-slate-100 prose-p:text-slate-800' : 'dark:prose-p:text-slate-200 prose-p:text-slate-800'} ${message.isError ? 'text-red-500' : ''}`}>
                            <SimpleMarkdownRenderer text={message.content} />
                        </div>
                    )}
                </div>

                {/* Sources and Feedback buttons (only for assistant) */}
                {!isUser && (
                  <>
                    {message.sources && message.sources.length > 0 && (
                        <div className="mt-1">
                            <div className="flex flex-wrap gap-2">
                                {message.sources.map((source, index) => (
                                    <SourceCitation key={index} source={source} />
                                ))}
                            </div>
                        </div>
                    )}
                    {!message.isError && (
                        <div className="flex items-center gap-2 text-slate-500">
                            <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><ThumbsUpIcon /></button>
                            <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><ThumbsDownIcon /></button>
                            <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><FavoriteIcon /></button>
                        </div>
                    )}
                  </>
                )}
            </div>
        </div>
    );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ session, isSending }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [session.messages, isSending]);

    const handleDownload = async () => {
        const paragraphs = session.messages.flatMap(message => {
            const roleRun = new TextRun({
                text: `${message.role === 'user' ? 'User' : 'Assistant'}: `,
                bold: true,
            });
    
            const contentRuns = (message.content || '').split(/(\*\*.*?\*\*)/g).map(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return new TextRun({ text: part.slice(2, -2), bold: true });
                }
                return new TextRun(part);
            });
    
            const contentParagraph = new Paragraph({
                children: [roleRun, ...contentRuns],
            });
            
            const attachmentParagraphs = [];
            if (message.attachment) {
                attachmentParagraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `[Attached file: ${message.attachment.name}]`,
                                italics: true,
                            }),
                        ],
                    })
                );
            }
    
            return [contentParagraph, ...attachmentParagraphs];
        });
    
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: `Chat History: ${session.title}`,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ text: "" }), // Spacer
                    ...paragraphs,
                ],
            }],
        });
    
        try {
            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to generate DOCX file:", error);
        }
    };

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
             <button
                onClick={handleDownload}
                className="sticky top-4 z-10 float-right mr-4 p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300"
                aria-label="Download chat"
             >
                <DownloadIcon />
            </button>
            <div className="max-w-4xl mx-auto">
                {session.messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isSending && (
                    <div className="flex items-start gap-4 py-6 px-4 md:px-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                            <BotIcon />
                        </div>
                        <div className="flex-1 pt-2 flex items-center gap-2">
                             <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                             <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                             <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;