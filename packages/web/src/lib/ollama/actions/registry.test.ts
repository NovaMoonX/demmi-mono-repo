import { describe, it, expect, vi } from 'vitest';
vi.mock('ollama/browser', () => {
  const mockClient = { chat: vi.fn(), generate: vi.fn(), list: vi.fn(), pull: vi.fn() };
  class MockOllama {
    chat = mockClient.chat;
    generate = mockClient.generate;
    list = mockClient.list;
    pull = mockClient.pull;
  }
  return { Ollama: MockOllama };
});

vi.mock('../prompts/recipe.prompts', () => ({
  RECIPE_NAME_PROMPT: '', RECIPE_INFO_PROMPT: '', RECIPE_DESCRIPTION_PROMPT: '',
  RECIPE_INGREDIENTS_PROMPT: '', RECIPE_INSTRUCTIONS_PROMPT: '',
}));

vi.mock('../schemas/recipe.schemas', () => ({
  RECIPE_NAME_SCHEMA: {}, RECIPE_INFO_SCHEMA: {}, RECIPE_DESCRIPTION_SCHEMA: {},
  RECIPE_INGREDIENTS_SCHEMA: {}, RECIPE_INSTRUCTIONS_SCHEMA: {},
}));

vi.mock('../prompts', () => ({ GENERAL_PROMPT: '' }));
vi.mock('../schemas', () => ({ GENERAL_SCHEMA: {} }));

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
