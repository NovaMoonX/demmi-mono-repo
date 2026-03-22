jest.mock('ollama/browser', () => {
  const mockClient = { chat: jest.fn(), generate: jest.fn(), list: jest.fn(), pull: jest.fn() };
  return { Ollama: jest.fn(() => mockClient) };
});

jest.mock('../prompts/recipe.prompts', () => ({
  RECIPE_NAME_PROMPT: '', RECIPE_INFO_PROMPT: '', RECIPE_DESCRIPTION_PROMPT: '',
  RECIPE_INGREDIENTS_PROMPT: '', RECIPE_INSTRUCTIONS_PROMPT: '',
  RECIPE_ITERATION_VALIDATION_PROMPT: '', RECIPE_ITERATION_SUMMARY_PROMPT: '',
  buildFieldDetectionPrompt: jest.fn(() => ''),
}));

jest.mock('../schemas/recipe.schemas', () => ({
  RECIPE_NAME_SCHEMA: {}, RECIPE_INFO_SCHEMA: {}, RECIPE_DESCRIPTION_SCHEMA: {},
  RECIPE_INGREDIENTS_SCHEMA: {}, RECIPE_INSTRUCTIONS_SCHEMA: {},
  RECIPE_FIELD_DETECTION_SCHEMA: {}, RECIPE_ITERATION_VALIDATION_SCHEMA: {},
  RECIPE_ITERATION_SUMMARY_SCHEMA: {},
}));

jest.mock('@store/index', () => ({
  store: { getState: () => ({ ingredients: { items: [] } }) },
}));

import { iterateRecipeAction } from './iterateRecipeAction';

describe('iterateRecipeAction', () => {
  it('has correct type and is multi-step', () => {
    expect(iterateRecipeAction.type).toBe('iterateRecipe');
    expect(iterateRecipeAction.isMultiStep).toBe(true);
  });

  it('has steps defined', () => {
    expect(iterateRecipeAction.steps.length).toBeGreaterThan(0);
  });
});
