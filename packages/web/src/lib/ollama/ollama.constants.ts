import { ActionType } from './actions';

export const INTENT_ACTIONS: ActionType[] = ['general', 'createMeal'];

export const INTENT_ACTION_PROMPT_DESCRIPTION: Record<ActionType, string> = {
  general: 'User is asking questions, requesting tips, or having a discussion about cooking/nutrition',
  createMeal: 'User explicitly wants to CREATE / MAKE / ADD / GENERATE a specific recipe, meal, or dish',
};


export const INTENT_ACTION_SHORT_DESCRIPTIONS: Record<ActionType, string> = {
  general: 'General conversation and assistance',
  createMeal: 'Guided meal creation based on user preferences',
};
