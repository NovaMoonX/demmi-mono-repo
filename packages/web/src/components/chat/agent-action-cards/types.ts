import { AgentAction } from '@/lib/ollama/action-types';

export interface AgentActionCardProps {
  action: AgentAction;
  onConfirmIntent: () => void;
  onRejectIntent: () => void;
  onApprove: () => void;
  onReject: () => void;
  onAddToShoppingList?: () => Promise<number>;
  onSkipShoppingList?: () => void;
}