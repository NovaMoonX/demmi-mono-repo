import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from '@store/index';
import userReducer from '@store/slices/userSlice';
import demoReducer from '@store/slices/demoSlice';
import userProfileReducer from '@store/slices/userProfileSlice';
import ingredientsReducer from '@store/slices/ingredientsSlice';
import recipesReducer from '@store/slices/recipesSlice';
import chatsReducer from '@store/slices/chatsSlice';
import calendarReducer from '@store/slices/calendarSlice';
import shoppingListReducer from '@store/slices/shoppingListSlice';
import memoryReducer from '@store/slices/memorySlice';
import { openFoodFactsApi } from '@store/api/openFoodFactsApi';
import { fetchUserProfile, saveUserProfile } from './userProfileActions';
import type { UserProfile } from '@lib/userProfile';
import { getDoc, setDoc } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';

const mockProfile: UserProfile = {
  userId: 'user-1',
  displayName: 'Test User',
  dietaryRestrictions: [],
  customDietaryRestrictions: [],
  avoidIngredients: [],
  cuisinePreferences: [],
  cookingGoal: null,
  cookingGoalDetails: null,
  householdSize: 1,
  skillLevel: null,
  cookTimePreference: null,
  lovedMealDescription: null,
  dislikedMealDescription: null,
  autoPantryDeduct: null,
  createdAt: 1000000,
  updatedAt: 1000000,
  onboardingCompletedAt: null,
};

function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      ingredients: ingredientsReducer,
      recipes: recipesReducer,
      chats: chatsReducer,
      user: userReducer,
      calendar: calendarReducer,
      demo: demoReducer,
      shoppingList: shoppingListReducer,
      userProfile: userProfileReducer,
      memory: memoryReducer,
      [openFoodFactsApi.reducerPath]: openFoodFactsApi.reducer,
    },
    preloadedState: preloadedState as RootState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(openFoodFactsApi.middleware),
  });
}

describe('fetchUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips when demo mode is active', async () => {
    const store = createTestStore({
      demo: { isActive: true, isHydrated: true },
      user: { user: { uid: 'user-1', email: 'a@b.com', emailVerified: true }, loading: false },
    });

    const result = await store.dispatch(fetchUserProfile());
    expect(result.meta.requestStatus).toBe('rejected');
    expect(vi.mocked(getDoc)).not.toHaveBeenCalled();
  });

  it('returns null when document does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as unknown as DocumentSnapshot);

    const store = createTestStore({
      demo: { isActive: false, isHydrated: true },
      user: { user: { uid: 'user-1', email: 'a@b.com', emailVerified: true }, loading: false },
    });

    await store.dispatch(fetchUserProfile());
    const state = store.getState();
    expect(state.userProfile.profile).toBeNull();
  });

  it('sets profile when document exists', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => mockProfile,
    } as unknown as DocumentSnapshot);

    const store = createTestStore({
      demo: { isActive: false, isHydrated: true },
      user: { user: { uid: 'user-1', email: 'a@b.com', emailVerified: true }, loading: false },
    });

    await store.dispatch(fetchUserProfile());
    const state = store.getState();
    expect(state.userProfile.profile).toEqual(mockProfile);
  });
});

describe('saveUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips when demo mode is active', async () => {
    const store = createTestStore({
      demo: { isActive: true, isHydrated: true },
      user: { user: { uid: 'user-1', email: 'a@b.com', emailVerified: true }, loading: false },
    });

    const result = await store.dispatch(saveUserProfile({ householdSize: 3 }));
    expect(result.meta.requestStatus).toBe('rejected');
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('saves profile and returns updated document', async () => {
    const updatedProfile = { ...mockProfile, householdSize: 3 };
    vi.mocked(setDoc).mockResolvedValueOnce(undefined);
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => updatedProfile,
    } as unknown as DocumentSnapshot);

    const store = createTestStore({
      demo: { isActive: false, isHydrated: true },
      user: { user: { uid: 'user-1', email: 'a@b.com', emailVerified: true }, loading: false },
    });

    await store.dispatch(saveUserProfile({ householdSize: 3 }));
    const state = store.getState();
    expect(state.userProfile.profile?.householdSize).toBe(3);
  });
});
