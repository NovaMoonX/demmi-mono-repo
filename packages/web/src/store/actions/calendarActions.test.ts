import { configureStore } from '@reduxjs/toolkit';
import demoReducer from '@store/slices/demoSlice';
import userReducer from '@store/slices/userSlice';
import calendarReducer from '@store/slices/calendarSlice';
import {
  fetchPlannedRecipes,
  createPlannedRecipe,
  updatePlannedRecipe,
  deletePlannedRecipe,
} from './calendarActions';

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
  generatedId: jest.fn(() => 'test-id-123'),
}));

function createTestStore(demoActive: boolean, userId: string | null = 'user1') {
  return configureStore({
    reducer: {
      demo: demoReducer,
      user: userReducer,
      calendar: calendarReducer,
    },
    preloadedState: {
      demo: { isActive: demoActive, isHydrated: true } as never,
      user: { user: userId ? { uid: userId, email: 'a@b.com', emailVerified: true } : null, loading: false } as never,
      calendar: { plannedRecipes: [], loading: false, error: null } as never,
    },
  });
}

describe('calendarActions', () => {
  describe('fetchPlannedRecipes', () => {
    it('skips execution when demo mode is active', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(fetchPlannedRecipes());
      expect(result.meta.condition).toBe(false);
    });
  });

  describe('createPlannedRecipe', () => {
    it('returns local data in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(
        createPlannedRecipe({
          recipeId: 'r1',
          date: 1700000000000,
          category: 'dinner',
          notes: null,
        }),
      );
      expect(result.type).toBe('calendar/createPlannedRecipeAsync/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.userId).toBe('demo');
      expect(payload.id).toBe('test-id-123');
    });
  });

  describe('updatePlannedRecipe', () => {
    it('returns recipe as-is in demo mode', async () => {
      const store = createTestStore(true);
      const planned = {
        id: 'p1',
        userId: 'demo',
        recipeId: 'r1',
        date: 1700000000000,
        category: 'dinner' as const,
        notes: null,
      };
      const result = await store.dispatch(updatePlannedRecipe(planned));
      expect(result.type).toBe('calendar/updatePlannedRecipeAsync/fulfilled');
      expect(result.payload).toEqual(planned);
    });
  });

  describe('deletePlannedRecipe', () => {
    it('returns id in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(deletePlannedRecipe('p1'));
      expect(result.type).toBe('calendar/deletePlannedRecipeAsync/fulfilled');
      expect(result.payload).toBe('p1');
    });
  });
});
