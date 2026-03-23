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
  RECIPE_ITERATION_VALIDATION_PROMPT: '', RECIPE_ITERATION_SUMMARY_PROMPT: '',
  buildFieldDetectionPrompt: vi.fn(() => ''),
}));

vi.mock('../schemas/recipe.schemas', () => ({
  RECIPE_NAME_SCHEMA: {}, RECIPE_INFO_SCHEMA: {}, RECIPE_DESCRIPTION_SCHEMA: {},
  RECIPE_INGREDIENTS_SCHEMA: {}, RECIPE_INSTRUCTIONS_SCHEMA: {},
  RECIPE_FIELD_DETECTION_SCHEMA: {}, RECIPE_ITERATION_VALIDATION_SCHEMA: {},
  RECIPE_ITERATION_SUMMARY_SCHEMA: {},
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
