export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number; // milliseconds timestamp
  model: string | null; // model used to generate this message (null for user messages)
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  isPinned: boolean;
  lastUpdated: number; // milliseconds timestamp
  userId: string; // owner's Firebase Auth uid
}
