
import type { Prompt } from './types';

// NOTE FOR DEV TEAM: This should be configured via environment variables, e.g., process.env.REACT_APP_API_BASE
export const API_BASE_URL = 'https://theintellect.app.n8n.cloud'; // Replace with your actual API base URL

export const CLIENT_NAME = 'M&E';

// Placeholder user and project IDs for API calls
export const USER_ID = 'user-123';
export const PROJECT_ID = 'project-456';

export const RECOMMENDED_PROMPTS: Prompt[] = [
  {
    id: 'prompt-1',
    title: 'Extract deliverables',
    description: 'Extract deliverables and acceptance criteria from this document.',
    author: 'M&E System',
    tag: 'ADVANCED',
  },
  {
    id: 'prompt-2',
    title: 'Generate RFI questions',
    description: 'Produce prioritized RFI questions for tender clarifications.',
    author: 'M&E System',
  },
  {
    id: 'prompt-3',
    title: 'Create site briefing',
    description: '200-word site briefing for operations team.',
    author: 'M&E System',
  },
    {
    id: 'prompt-4',
    title: 'Summarize key risks',
    description: 'Identify and summarize the key risks mentioned in the report.',
    author: 'M&E System',
  },
    {
    id: 'prompt-5',
    title: 'Check for compliance',
    description: 'Verify if the attached proposal meets all stated compliance requirements.',
    author: 'M&E System',
    tag: 'LEGAL',
  },
    {
    id: 'prompt-6',
    title: 'Draft a response email',
    description: 'Draft a polite but firm email responding to the client\'s concerns.',
    author: 'M&E System',
  },
];
