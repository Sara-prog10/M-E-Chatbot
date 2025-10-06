import React, { useState, RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { summarizeDocument } from '../services/geminiService';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import DownloadIcon from './icons/DownloadIcon';

interface DocumentSummarizerProps {
    fileInputRef: RefObject<HTMLInputElement>;
}

const DocumentSummarizer: React.FC<DocumentSummarizerProps> = ({ fileInputRef }) => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const allowedFileTypes = ['text/plain', 'application/pdf'];

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile && allowedFileTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setSummary('');
      setError('');
      setProgress(0);
    } else {
      setError('Only .txt and .pdf files are supported.');
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSummarize = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    const progressInterval = setInterval(() => {
        setProgress(prev => {
            if(prev >= 95) {
                clearInterval(progressInterval);
                return prev;
            }
            return prev + 5;
        });
    }, 100);

    try {
        const result = await summarizeDocument(file);
        setSummary(result);
        setProgress(100);
    } catch (e) {
        if (!error) { // Don't overwrite specific error messages
          setError('Failed to read or summarize the file.');
        }
    } finally {
        setIsLoading(false);
        clearInterval(progressInterval);
    }
  };
  
  const handleDownloadSummary = async () => {
    if (!summary || !file) return;

    try {
        const paragraphs: Paragraph[] = [];
        const lines = summary.split('\n');

        for (const line of lines) {
            if (line.startsWith('## ')) {
                paragraphs.push(new Paragraph({
                    text: line.substring(3),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 240, after: 120 },
                }));
            } else if (line.startsWith('### ')) {
                paragraphs.push(new Paragraph({
                    text: line.substring(4),
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                }));
            } else if (line.startsWith('- ')) {
                const content = line.substring(2);
                const boldMatch = content.match(/^\*\*(.*?):\*\*(.*)/);
                if (boldMatch) {
                    paragraphs.push(new Paragraph({
                        children: [
                            new TextRun({ text: `${boldMatch[1]}:`, bold: true }),
                            new TextRun(boldMatch[2]),
                        ],
                        bullet: { level: 0 },
                    }));
                } else {
                    paragraphs.push(new Paragraph({
                        text: content,
                        bullet: { level: 0 },
                    }));
                }
            } else if (line.trim()) {
                 paragraphs.push(new Paragraph({ text: line }));
            }
        }

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: "Document Summary",
                        heading: HeadingLevel.TITLE,
                    }),
                    new Paragraph({
                         children: [
                            new TextRun({ text: "Original File: ", italic: true }),
                            new TextRun({ text: file.name, italic: true }),
                         ]
                    }),
                    new Paragraph({ text: "" }),
                    ...paragraphs,
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = file.name.split('.').slice(0, -1).join('.') || file.name;
        a.download = `Summary-${baseName}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error("Error generating .docx summary:", e);
        setError("Sorry, an error occurred while creating the document.");
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  }
  
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(e.dataTransfer.files && e.dataTransfer.files[0]) {
       validateAndSetFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-background dark:bg-dark-background overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4 text-primary dark:text-dark-primary">Document Summarizer</h2>
        <p className="mb-6 text-secondary dark:text-dark-secondary">Upload a .txt or .pdf document to get a concise summary generated by AI.</p>
        
        <div onDragOver={onDragOver} onDrop={onDrop} className="border-2 border-dashed border-border dark:border-dark-border rounded-lg p-8 text-center bg-sidebar dark:bg-dark-sidebar cursor-pointer hover:border-primary/50 dark:hover:border-dark-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.pdf"
            />
            <p className="text-secondary dark:text-dark-secondary">Drag & drop a file here, or click to select a file (.txt, .pdf).</p>
        </div>

        {file && (
          <div className="mt-6 p-4 bg-sidebar dark:bg-dark-sidebar rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
                <p className="font-medium">Selected file: <span className="text-primary dark:text-dark-primary font-semibold">{file.name}</span></p>
                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 font-semibold">Clear</button>
            </div>
             {(isLoading || progress > 0) && (
              <div className="w-full bg-border dark:bg-dark-border rounded-full h-2.5 mt-2">
                <div className="bg-primary dark:bg-dark-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        
        <div className="mt-6 text-center">
            <button
                onClick={handleSummarize}
                disabled={!file || isLoading}
                className="px-8 py-3 bg-primary text-background dark:bg-dark-primary dark:text-dark-background font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? 'Summarizing...' : 'Generate Summary'}
            </button>
        </div>

        {summary && (
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-primary dark:text-dark-primary">Summary Result</h3>
                    <button
                        onClick={handleDownloadSummary}
                        disabled={!summary}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary dark:text-dark-secondary rounded-lg hover:bg-gray-200/60 dark:hover:bg-dark-bot-bubble disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Download Summary as .docx"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download</span>
                    </button>
                </div>
                <div className="p-6 bg-sidebar dark:bg-dark-sidebar rounded-lg shadow-sm text-primary dark:text-dark-primary leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-primary dark:text-dark-primary" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-semibold mt-3 mb-1 text-primary dark:text-dark-primary" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-4" {...props} />,
                        li: ({node, ...props}) => <li className="pl-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-primary dark:text-dark-primary" {...props} />,
                      }}
                    >
                        {summary}
                    </ReactMarkdown>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSummarizer;