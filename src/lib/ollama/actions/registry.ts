import { generalAction } from './generalAction';
import { createMealAction } from './createMealAction';
import type { ActionType } from './types';

type ActionHandlerMap = {
  general: typeof generalAction;
  createMeal: typeof createMealAction;
};

const ACTION_REGISTRY: ActionHandlerMap = {
  general: generalAction,
  createMeal: createMealAction,
};

export function getActionHandler<T extends ActionType>(actionType: T): ActionHandlerMap[T] {
  const handler = ACTION_REGISTRY[actionType];
  if (!handler) {
    throw new Error(`Unknown action type: ${actionType}`);
  }
  return handler;
}