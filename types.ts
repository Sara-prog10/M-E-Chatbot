
export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface Source {
  fileId: string;
  page: number;
  chunkId: string;
}

export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  sources?: Source[];
  responseId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  author: string;
  tag?: string;
}

export enum ChatMode {
  COMPANY = 'company',
  GLOBAL = 'global',
}

export interface UploadedFile {
  fileId: string;
  summary: string;
  suggestedPrompts: string[];
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}
