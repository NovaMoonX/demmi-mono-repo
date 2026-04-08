import { generalAction } from './generalAction';
import { createRecipeAction } from './createRecipeAction';
import { toolCallAction } from './toolCallAction';
import type { ActionType } from './types';

type ActionHandlerMap = {
  general: typeof generalAction;
  createRecipe: typeof createRecipeAction;
  toolCall: typeof toolCallAction;
};

const ACTION_REGISTRY: ActionHandlerMap = {
  general: generalAction,
  createRecipe: createRecipeAction,
  toolCall: toolCallAction,
};

export function getActionHandler<T extends ActionType>(actionType: T): ActionHandlerMap[T] {
  const handler = ACTION_REGISTRY[actionType];
  if (!handler) {
    throw new Error(`Unknown action type: ${actionType}`);
  }
  return handler;
}