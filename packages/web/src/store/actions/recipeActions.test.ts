import { configureStore } from '@reduxjs/toolkit';
import demoReducer from '@store/slices/demoSlice';
import userReducer from '@store/slices/userSlice';
import recipesReducer from '@store/slices/recipesSlice';
import {
  fetchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from './recipeActions';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  setDoc: jest.fn(),
  runTransaction: jest.fn(),
}));

jest.mock('@utils/generatedId', () => ({
  generatedId: jest.fn(() => 'recipe-id-123'),
}));

function createTestStore(demoActive: boolean) {
  return configureStore({
    reducer: {
      demo: demoReducer,
      user: userReducer,
      recipes: recipesReducer,
    },
    preloadedState: {
      demo: { isActive: demoActive, isHydrated: true } as never,
      user: { user: { uid: 'user1', email: 'a@b.com', emailVerified: true }, loading: false } as never,
      recipes: { items: [], loading: false, error: null } as never,
    },
  });
}

describe('recipeActions', () => {
  describe('fetchRecipes', () => {
    it('skips execution when demo mode is active', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(fetchRecipes());
      expect(result.meta.condition).toBe(true);
    });
  });

  describe('createRecipe', () => {
    it('returns local data in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(
        createRecipe({
          title: 'Pasta',
          description: 'Delicious pasta',
          category: 'dinner',
          prepTime: 10,
          cookTime: 20,
          servingSize: 4,
          instructions: ['Boil water', 'Cook pasta'],
          imageUrl: '',
          ingredients: [],
          share: null,
        }),
      );
      expect(result.type).toBe('recipes/createRecipeAsync/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.userId).toBe('demo');
      expect(payload.id).toBe('recipe-id-123');
    });
  });

  describe('updateRecipe', () => {
    it('returns recipe as-is in demo mode', async () => {
      const store = createTestStore(true);
      const recipe = {
        id: 'r1',
        userId: 'demo',
        title: 'Pasta',
        description: 'Delicious pasta',
        category: 'dinner' as const,
        prepTime: 10,
        cookTime: 20,
        servingSize: 4,
        instructions: ['Boil water'],
        imageUrl: '',
        ingredients: [],
        share: null,
      };
      const result = await store.dispatch(updateRecipe(recipe));
      expect(result.type).toBe('recipes/updateRecipeAsync/fulfilled');
      expect(result.payload).toEqual(recipe);
    });
  });

  describe('deleteRecipe', () => {
    it('returns id in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(deleteRecipe('r1'));
      expect(result.type).toBe('recipes/deleteRecipeAsync/fulfilled');
      expect(result.payload).toBe('r1');
    });
  });
});
