import { generalAction } from './generalAction';
import { createRecipeAction } from './createRecipeAction';
import type { ActionType } from './types';

type ActionHandlerMap = {
  general: typeof generalAction;
  createRecipe: typeof createRecipeAction;
};

const ACTION_REGISTRY: ActionHandlerMap = {
  general: generalAction,
  createRecipe: createRecipeAction,
};

export function getActionHandler<T extends ActionType>(actionType: T): ActionHandlerMap[T] {
  const handler = ACTION_REGISTRY[actionType];
  if (!handler) {
    throw new Error(`Unknown action type: ${actionType}`);
  }
  return handler;
}