import {
  AgentCreateRecipeAction,
  CreateRecipeAgentActionStatus,
} from './createRecipeAction.types';
import {
  AgentToolCallAction,
  ToolCallAgentActionStatus,
} from './toolCallAction.types';

export type AgentActionStatus = CreateRecipeAgentActionStatus | ToolCallAgentActionStatus;
export type AgentAction = AgentCreateRecipeAction | AgentToolCallAction;
