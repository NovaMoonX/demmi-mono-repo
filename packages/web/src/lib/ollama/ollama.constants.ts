import { ActionType } from './actions';

export const INTENT_ACTIONS: ActionType[] = ['general', 'createRecipe'];

export const INTENT_ACTION_PROMPT_DESCRIPTION: Record<ActionType, string> = {
  general: 'User is asking questions, requesting tips, or having a discussion about cooking/nutrition',
  createRecipe: 'User explicitly wants to CREATE / MAKE / ADD / GENERATE a specific recipe, recipe, or dish',
};


export const INTENT_ACTION_SHORT_DESCRIPTIONS: Record<ActionType, string> = {
  general: 'General conversation and assistance',
  createRecipe: 'Guided recipe creation based on user preferences',
};
