import { describe, it, expect } from 'vitest';

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
