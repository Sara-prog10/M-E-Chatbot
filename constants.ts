import type { Prompt } from './types';

// This data can be used to seed the Firebase database initially.
// The app will primarily fetch prompts from Firebase.
export const RECOMMENDED_PROMPTS: Prompt[] = [
  {
    title: '[UX Content Writing]',
    description: 'Help me write more like...',
    author: 'Benjamin',
    authorId: 'system',
    tag: 'ADVANCED',
    promptText: 'Analyze the provided text and help me write new content in a similar style, focusing on tone, vocabulary, and sentence structure.',
    isPublic: true,
  },
  {
    title: '[UX Content Writing]',
    description: 'Help me write Tooltips',
    author: 'Benjamin',
    authorId: 'system',
    tag: 'ADVANCED',
    promptText: 'Generate a concise and helpful tooltip for a user interface element described as follows: [Describe element and its function here].',
    isPublic: true,
  },
  {
    title: '[HK CBG] Get answers on CBG Confluence Page',
    description: 'Get answers from the CBG Confluence Page',
    author: 'William H.',
    authorId: 'system',
    tag: 'ADVANCED',
    promptText: 'Based on the CBG Confluence Page, what is the process for [your question here]?',
    isPublic: true,
  },
  {
    title: 'Extract deliverables',
    description: 'Extract deliverables and acceptance criteria from this document.',
    author: 'M&E-GPT',
    authorId: 'system',
    tag: 'PROJECTS',
    promptText: 'From the attached document, please extract a list of all project deliverables and their corresponding acceptance criteria. Present this in a table format.',
    isPublic: true,
  },
  {
    title: 'Generate RFI questions',
    description: 'Produce prioritized RFI questions for tender clarifications.',
    author: 'M&E-GPT',
    authorId: 'system',
    tag: 'TENDERS',
    promptText: 'After reviewing the attached tender document, generate a list of prioritized Request for Information (RFI) questions to seek clarification from the client. Group them by urgency.',
    isPublic: true,
  },
  {
    title: 'Create site briefing',
    description: '200-word site briefing for operations team.',
    author: 'M&E-GPT',
    authorId: 'system',
    tag: 'OPERATIONS',
    promptText: 'Using the information in the attached project summary, create a 200-word site briefing for the operations team. Include key objectives, safety warnings, and primary points of contact.',
    isPublic: true,
  }
];
