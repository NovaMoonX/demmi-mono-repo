import { describe, it, expect, vi } from 'vitest';
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
  generatedId: vi.fn(() => 'test-id-123'),
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
      user: {
        user: userId
          ? { uid: userId, email: 'a@b.com', emailVerified: true }
          : null,
        loading: false,
      } as never,
      calendar: { plannedRecipes: [], loading: false, error: null } as never,
    },
  });
}

describe('calendarActions', () => {
  describe('fetchPlannedRecipes', () => {
    it('skips execution when demo mode is active', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(fetchPlannedRecipes());
      expect(result.meta.requestStatus).toBe('rejected');
      expect(
        (result as ReturnType<typeof fetchPlannedRecipes.rejected>).meta
          .condition,
      ).toBe(true);
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
