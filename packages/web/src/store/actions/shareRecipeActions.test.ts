import { configureStore } from '@reduxjs/toolkit';
import demoReducer from '@store/slices/demoSlice';
import userReducer from '@store/slices/userSlice';
import recipesReducer from '@store/slices/recipesSlice';
import ingredientsReducer from '@store/slices/ingredientsSlice';
import {
  shareRecipe,
  unshareRecipe,
  fetchSharedRecipe,
} from './shareRecipeActions';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  runTransaction: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  get: jest.fn().mockResolvedValue({ exists: () => false, val: () => null }),
}));

jest.mock('@utils/generatedId', () => ({
  generatedId: jest.fn(() => 'share-id-123'),
}));

function createTestStore(demoActive: boolean) {
  return configureStore({
    reducer: {
      demo: demoReducer,
      user: userReducer,
      recipes: recipesReducer,
      ingredients: ingredientsReducer,
    },
    preloadedState: {
      demo: { isActive: demoActive, isHydrated: true } as never,
      user: { user: { uid: 'user1', email: 'a@b.com', emailVerified: true }, loading: false } as never,
      recipes: { items: [], loading: false, error: null } as never,
      ingredients: { items: [], loading: false, error: null } as never,
    },
  });
}

const mockRecipe = {
  id: 'r1',
  userId: 'demo',
  title: 'Pasta',
  description: 'Tasty',
  category: 'dinner' as const,
  prepTime: 10,
  cookTime: 20,
  servingSize: 4,
  instructions: ['Step 1'],
  imageUrl: '',
  ingredients: [],
  share: null,
};

describe('shareRecipeActions', () => {
  describe('shareRecipe', () => {
    it('returns local share in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(shareRecipe(mockRecipe));
      expect(result.type).toBe('recipes/shareRecipe/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      const share = payload.share as Record<string, unknown>;
      expect(share.id).toBe('share-id-123');
    });
  });

  describe('unshareRecipe', () => {
    it('clears share in demo mode', async () => {
      const store = createTestStore(true);
      const recipe = { ...mockRecipe, share: { id: 's1', sharedAt: 1000 } };
      const result = await store.dispatch(unshareRecipe(recipe));
      expect(result.type).toBe('recipes/unshareRecipe/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.share).toBeNull();
    });
  });

  describe('fetchSharedRecipe', () => {
    it('returns null when shared recipe not found', async () => {
      const store = createTestStore(false);
      const result = await store.dispatch(fetchSharedRecipe('nonexistent'));
      expect(result.type).toBe('recipes/fetchSharedRecipe/fulfilled');
      expect(result.payload).toBeNull();
    });
  });
});
