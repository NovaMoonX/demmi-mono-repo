import type { AgentCreateRecipeAction } from '@/lib/ollama/action-types/createRecipeAction.types';
import type { AgentToolCallAction } from '@/lib/ollama/action-types/toolCallAction.types';

export interface AgentActionCardProps {
  action: AgentCreateRecipeAction;
  onConfirmIntent: () => void;
  onRejectIntent: () => void;
  onApprove: () => void;
  onReject: () => void;
  onAddToShoppingList?: () => Promise<number>;
  onSkipShoppingList?: () => void;
}

export interface ToolCallActionCardProps {
  action: AgentToolCallAction;
  onConfirmToolCall?: (toolIndex: number) => void;
  onRejectToolCall?: (toolIndex: number) => void;
}