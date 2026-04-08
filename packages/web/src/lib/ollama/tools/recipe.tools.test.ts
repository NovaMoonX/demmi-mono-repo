import { describe, it, expect, vi } from 'vitest';
import { searchRecipesTool, getRecipeTool, deleteRecipeTool } from './recipe.tools';
import type { ToolContext } from './tool.types';
import type { RootState, AppDispatch } from '@store/index';

const mockState = {
  recipes: {
    items: [
      {
        id: 'r1', userId: 'user-1', title: 'Pasta Carbonara', description: 'Classic Italian',
        category: 'dinner', cuisine: 'italian', prepTime: 15, cookTime: 20,
        servingSize: 4, instructions: ['Cook pasta', 'Add sauce'], imageUrl: '',
        ingredients: [{ ingredientId: 'i1', servings: 2 }], share: null,
      },
      {
        id: 'r2', userId: 'user-1', title: 'Avocado Toast', description: 'Quick breakfast',
        category: 'breakfast', cuisine: 'american', prepTime: 5, cookTime: 5,
        servingSize: 1, instructions: ['Toast bread', 'Add avocado'], imageUrl: '',
        ingredients: [], share: null,
      },
    ],
  },
  ingredients: {
    items: [
      { id: 'i1', name: 'Spaghetti', type: 'grains', unit: 'g' },
    ],
  },
} as unknown as RootState;

const mockContext: ToolContext = {
  getState: vi.fn(() => mockState),
  dispatch: vi.fn() as unknown as AppDispatch,
  userId: 'user-1',
};

describe('recipe.tools', () => {
  describe('search_recipes', () => {
    it('returns matching recipes from state', async () => {
      const result = await searchRecipesTool.execute({ query: 'pasta' }, mockContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'r1', title: 'Pasta Carbonara' }),
        ]),
      );
    });

    it('returns empty list with no matches', async () => {
      const result = await searchRecipesTool.execute({ query: 'sushi' }, mockContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toHaveLength(0);
    });

    it('filters by category', async () => {
      const result = await searchRecipesTool.execute({ category: 'breakfast' }, mockContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toEqual(expect.objectContaining({ id: 'r2' }));
    });
  });

  describe('get_recipe', () => {
    it('returns recipe details', async () => {
      const result = await getRecipeTool.execute({ recipe_id: 'r1' }, mockContext);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({ id: 'r1', title: 'Pasta Carbonara' }));
    });

    it('returns error for non-existent recipe', async () => {
      const result = await getRecipeTool.execute({ recipe_id: 'nope' }, mockContext);

      expect(result.success).toBe(false);
      expect(result.displayType).toBe('error');
    });
  });

  describe('delete_recipe', () => {
    it('returns confirmation data with requiresConfirmation', () => {
      expect(deleteRecipeTool.requiresConfirmation).toBe(true);
    });
  });
});
