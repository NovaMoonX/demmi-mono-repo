export type MemoryCategory =
  | 'preference'
  | 'context'
  | 'goal'
  | 'household'
  | 'other';

export interface AgentMemory {
  id: string;
  userId: string;
  content: string;
  category: MemoryCategory;
  createdAt: number;
  updatedAt: number;
}
