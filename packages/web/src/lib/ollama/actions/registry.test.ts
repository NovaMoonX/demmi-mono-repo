import { describe, it, expect } from 'vitest';
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

  it('returns toolCallAction for toolCall type', () => {
    const handler = getActionHandler('toolCall');
    expect(handler.type).toBe('toolCall');
  });

  it('throws for unknown action type', () => {
    expect(() => getActionHandler('unknown' as never)).toThrow('Unknown action type');
  });
});
