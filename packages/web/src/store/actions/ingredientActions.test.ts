import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import demoReducer from '@store/slices/demoSlice';
import userReducer from '@store/slices/userSlice';
import ingredientsReducer from '@store/slices/ingredientsSlice';
import {
  fetchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from './ingredientActions';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  setDoc: vi.fn(),
  runTransaction: vi.fn(),
}));

vi.mock('@utils/generatedId', () => ({
  generatedId: vi.fn(() => 'ing-id-123'),
}));

function createTestStore(demoActive: boolean) {
  return configureStore({
    reducer: {
      demo: demoReducer,
      user: userReducer,
      ingredients: ingredientsReducer,
    },
    preloadedState: {
      demo: { isActive: demoActive, isHydrated: true } as never,
      user: {
        user: { uid: 'user1', email: 'a@b.com', emailVerified: true },
        loading: false,
      } as never,
      ingredients: { items: [], loading: false, error: null } as never,
    },
  });
}

describe('ingredientActions', () => {
  describe('fetchIngredients', () => {
    it('skips execution when demo mode is active', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(fetchIngredients());
      expect(result.meta.requestStatus).toBe('rejected');
      expect(
        (result as ReturnType<typeof fetchIngredients.rejected>).meta.condition,
      ).toBe(true);
    });
  });

  describe('createIngredient', () => {
    it('returns local data in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(
        createIngredient({
          name: 'Tomato',
          type: 'produce',
          imageUrl: '',
          nutrients: {
            protein: 1,
            carbs: 4,
            fat: 0,
            fiber: 1,
            sugar: 3,
            sodium: 5,
            calories: 22,
          },
          currentAmount: 5,
          servingSize: 1,
          unit: 'piece',
          otherUnit: null,
          products: [],
          defaultProductId: null,
          barcode: null,
        }),
      );
      expect(result.type).toBe('ingredients/createIngredientAsync/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.userId).toBe('demo');
      expect(payload.id).toBe('ing-id-123');
    });
  });

  describe('updateIngredient', () => {
    it('returns ingredient as-is in demo mode', async () => {
      const store = createTestStore(true);
      const ingredient = {
        id: 'i1',
        userId: 'demo',
        name: 'Tomato',
        type: 'produce' as const,
        imageUrl: '',
        nutrients: {
          protein: 1,
          carbs: 4,
          fat: 0,
          fiber: 1,
          sugar: 3,
          sodium: 5,
          calories: 22,
        },
        currentAmount: 5,
        servingSize: 1,
        unit: 'piece' as const,
        otherUnit: null,
        products: [],
        defaultProductId: null,
        barcode: null,
      };
      const result = await store.dispatch(updateIngredient(ingredient));
      expect(result.type).toBe('ingredients/updateIngredientAsync/fulfilled');
      expect(result.payload).toEqual(ingredient);
    });
  });

  describe('deleteIngredient', () => {
    it('returns id in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(deleteIngredient('i1'));
      expect(result.type).toBe('ingredients/deleteIngredientAsync/fulfilled');
      expect(result.payload).toBe('i1');
    });
  });
});
