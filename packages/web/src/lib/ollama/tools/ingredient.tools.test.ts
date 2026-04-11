import { describe, it, expect, vi } from 'vitest';
import { searchIngredientsTool, getIngredientTool, createIngredientTool, deleteIngredientTool } from './ingredient.tools';
import type { ToolContext } from './tool.types';
import type { RootState, AppDispatch } from '@store/index';

const mockState = {
  ingredients: {
    items: [
      {
        id: 'i1', userId: 'user-1', name: 'Chicken Breast', type: 'meat',
        imageUrl: '', nutrients: { protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, calories: 165 },
        currentAmount: 2, servingSize: 1, unit: 'lb', otherUnit: null,
        products: [], defaultProductId: null, barcode: null,
      },
      {
        id: 'i2', userId: 'user-1', name: 'Basil', type: 'produce',
        imageUrl: '', nutrients: { protein: 0.3, carbs: 0.2, fat: 0, fiber: 0.2, sugar: 0, sodium: 0, calories: 1 },
        currentAmount: 10, servingSize: 1, unit: 'piece', otherUnit: null,
        products: [], defaultProductId: null, barcode: null,
      },
    ],
  },
} as unknown as RootState;

const mockContext: ToolContext = {
  getState: vi.fn(() => mockState),
  dispatch: vi.fn() as unknown as AppDispatch,
  userId: 'user-1',
};

describe('ingredient.tools', () => {
  describe('search_ingredients', () => {
    it('returns matching ingredients from state', async () => {
      const result = await searchIngredientsTool.execute({ query: 'chicken' }, mockContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toEqual(expect.objectContaining({ id: 'i1', name: 'Chicken Breast' }));
    });

    it('filters by type', async () => {
      const result = await searchIngredientsTool.execute({ type: 'produce' }, mockContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toEqual(expect.objectContaining({ id: 'i2' }));
    });

    it('returns empty list with no matches', async () => {
      const result = await searchIngredientsTool.execute({ query: 'saffron' }, mockContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toHaveLength(0);
    });
  });

  describe('get_ingredient', () => {
    it('returns ingredient details', async () => {
      const result = await getIngredientTool.execute({ ingredient_id: 'i1' }, mockContext);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({ id: 'i1', name: 'Chicken Breast' }));
    });

    it('returns error for non-existent ingredient', async () => {
      const result = await getIngredientTool.execute({ ingredient_id: 'nope' }, mockContext);

      expect(result.success).toBe(false);
      expect(result.displayType).toBe('error');
    });
  });

  describe('create_ingredient', () => {
    it('returns error when name is missing', async () => {
      const result = await createIngredientTool.execute({
        type: 'produce',
      }, mockContext);

      expect(result.success).toBe(false);
      expect(result.displayType).toBe('error');
      expect(result.message).toContain('name is required');
    });

    it('dispatches createIngredient thunk on success', async () => {
      const mockNewIngredient = {
        id: 'new-i1', userId: 'user-1', name: 'Tomatoes', type: 'produce',
        imageUrl: '', nutrients: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, calories: 0 },
        currentAmount: 5, servingSize: 1, unit: 'piece', otherUnit: null,
        products: [], defaultProductId: null, barcode: null,
      };

      const mockDispatch = vi.fn().mockResolvedValue({
        type: 'ingredients/createIngredientAsync/fulfilled',
        payload: mockNewIngredient,
        meta: { requestId: '1', arg: {} },
      });

      const createContext: ToolContext = {
        getState: vi.fn(() => mockState),
        dispatch: mockDispatch as unknown as AppDispatch,
        userId: 'user-1',
      };

      const result = await createIngredientTool.execute({
        name: 'Tomatoes',
        type: 'produce',
        currentAmount: 5,
        unit: 'piece',
      }, createContext);

      expect(mockDispatch).toHaveBeenCalled();
      expect(result.displayType).toBe('success');
    });

    it('does not require confirmation', () => {
      expect(createIngredientTool.requiresConfirmation).toBe(false);
    });
  });

  describe('delete_ingredient', () => {
    it('returns confirmation data with requiresConfirmation', () => {
      expect(deleteIngredientTool.requiresConfirmation).toBe(true);
    });
  });
});
