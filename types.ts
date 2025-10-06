
export enum ChatMode {
  COMPANY = 'Company',
  GLOBAL = 'Global',
  SUMMARIZER = 'Summarizer',
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  mode: ChatMode;
}
