import { describe, it, expect } from 'vitest';
import reducer, { setProfile, clearProfile, setLoading, setError } from './userProfileSlice';
import type { UserProfile } from '@lib/userProfile';

const mockProfile: UserProfile = {
  userId: 'user-1',
  displayName: 'Test User',
  dietaryRestrictions: ['vegetarian'],
  customDietaryRestrictions: [],
  avoidIngredients: [],
  cuisinePreferences: ['italian'],
  cookingGoal: 'eat-healthier',
  cookingGoalDetails: null,
  householdSize: 2,
  skillLevel: 'intermediate',
  cookTimePreference: '30-min',
  lovedMealDescription: null,
  dislikedMealDescription: null,
  autoPantryDeduct: null,
  createdAt: 1000000,
  updatedAt: 1000000,
  onboardingCompletedAt: null,
};

describe('userProfileSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ profile: null, loading: false, error: null });
  });

  it('handles setProfile', () => {
    const state = reducer(undefined, setProfile(mockProfile));
    expect(state.profile).toEqual(mockProfile);
  });

  it('handles clearProfile', () => {
    const initial = { profile: mockProfile, loading: false, error: 'some error' };
    const state = reducer(initial, clearProfile());
    expect(state.profile).toBeNull();
    expect(state.error).toBeNull();
  });

  it('handles setLoading', () => {
    const state = reducer(undefined, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it('handles setError', () => {
    const state = reducer(undefined, setError('Something went wrong'));
    expect(state.error).toBe('Something went wrong');
  });

  it('handles setError with null', () => {
    const initial = { profile: null, loading: false, error: 'old error' };
    const state = reducer(initial, setError(null));
    expect(state.error).toBeNull();
  });
});
