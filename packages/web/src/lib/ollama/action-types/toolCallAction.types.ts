import type { ToolDisplayType } from '../tools/tool.types';

export type ToolCallAgentActionStatus =
  | 'calling_tools'
  | 'pending_confirmation'
  | 'executing'
  | 'completed'
  | 'failed';

export interface ToolCallResultInfo {
  toolName: string;
  args: Record<string, unknown>;
  status: 'pending' | 'confirmed' | 'rejected' | 'executing' | 'completed' | 'failed';
  requiresConfirmation: boolean;
  result: {
    success: boolean;
    data: unknown;
    displayType: ToolDisplayType;
    message: string;
  } | null;
}

export interface AgentToolCallAction {
  type: 'tool_call';
  status: ToolCallAgentActionStatus;
  toolCalls: ToolCallResultInfo[];
  currentToolIndex: number;
}
