jest.mock('ollama/browser', () => {
  const mockClient = { chat: jest.fn(), generate: jest.fn(), list: jest.fn(), pull: jest.fn() };
  return { Ollama: jest.fn(() => mockClient) };
});

jest.mock('../prompts/recipe.prompts', () => ({
  RECIPE_NAME_PROMPT: '', RECIPE_INFO_PROMPT: '', RECIPE_DESCRIPTION_PROMPT: '',
  RECIPE_INGREDIENTS_PROMPT: '', RECIPE_INSTRUCTIONS_PROMPT: '',
}));

jest.mock('../schemas/recipe.schemas', () => ({
  RECIPE_NAME_SCHEMA: {}, RECIPE_INFO_SCHEMA: {}, RECIPE_DESCRIPTION_SCHEMA: {},
  RECIPE_INGREDIENTS_SCHEMA: {}, RECIPE_INSTRUCTIONS_SCHEMA: {},
}));

jest.mock('../prompts', () => ({ GENERAL_PROMPT: '' }));
jest.mock('../schemas', () => ({ GENERAL_SCHEMA: {} }));
jest.mock('@store/index', () => ({ store: { getState: () => ({ ingredients: { items: [] } }) } }));

import { getActionHandler } from './registry';

describe('registry', () => {
  it('returns generalAction for general type', () => {
    const handler = getActionHandler('general');
    expect(handler.type).toBe('general');
  });

  it('returns createRecipeAction for createRecipe type', () => {
    const handler = getActionHandler('createRecipe');
    expect(handler.type).toBe('createRecipe');
  });

  it('throws for unknown action type', () => {
    expect(() => getActionHandler('unknown' as never)).toThrow('Unknown action type');
  });
});
