export interface Source {
  fileId: string;
  page: number;
  chunkId: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isError?: boolean;
  attachment?: {
    type: 'image';
    url: string;
    name: string;
  } | {
    type: 'other';
    name: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export interface Prompt {
  id?: string; // Firebase key
  title: string;
  description: string;
  author: string;
  authorId: string; // ID of the user who created it
  tag: string;
  promptText: string;
  isPublic: boolean; // Whether the prompt is visible to all users
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ChatRequest {
    userId: string;
    sessionId: string;
    chatMode: 'company' | 'global';
    message: string;
    fileIds?: string[];
}

export interface ChatResponse {
    answer: string;
    sources: Source[];
    rawModelId: string;
    responseId: string;
}

export interface UploadResult {
  summary: string;
  suggestedPrompts: string[];
}

export interface User {
  id: string;
  username: string;
}

export type Theme = 'light' | 'dark';