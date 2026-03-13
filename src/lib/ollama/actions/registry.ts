import { generalAction } from './generalAction';
import type { ActionType } from './types';

type ActionHandlerMap = {
  general: typeof generalAction;
  createMeal: undefined; // Placeholder until implemented
};

const ACTION_REGISTRY: ActionHandlerMap = {
  general: generalAction,
  createMeal: undefined, // Placeholder until implemented
};

export function getActionHandler<T extends ActionType>(actionType: T): ActionHandlerMap[T] {
  const handler = ACTION_REGISTRY[actionType];
  if (!handler) {
    throw new Error(`Unknown action type: ${actionType}`);
  }
  return handler;
}
