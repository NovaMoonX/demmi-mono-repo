import type { AgentAction } from './agent-actions.types';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number; // milliseconds timestamp
  model: string | null; // model used to generate this message (null for user messages)
  rawContent: string | null; // original JSON from the AI (used for conversation context)
  agentAction: AgentAction | null; // structured action proposed by the AI, pending user approval
  /** 2-3 sentence summary of the message exchange for context-efficient intent detection.
   * Generated asynchronously after each exchange. Null until generated or for legacy messages. */
  summary: string | null;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  isPinned: boolean;
  lastUpdated: number; // milliseconds timestamp
  userId: string; // owner's Firebase Auth uid
}
