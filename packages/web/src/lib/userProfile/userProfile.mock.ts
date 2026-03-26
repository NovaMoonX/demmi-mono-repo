import { DEMO_USER_ID } from '@lib/app';
import type { UserProfile } from './userProfile.types';

export const mockUserProfile: UserProfile = {
  userId: DEMO_USER_ID,
  displayName: 'Demo User',
  dietaryRestrictions: [],
  customDietaryRestrictions: [],
  avoidIngredients: [],
  cuisinePreferences: [],
  cookingGoal: ['eat-healthier'],
  cookingGoalDetails: null,
  householdSize: 2,
  skillLevel: 'intermediate',
  cookTimePreference: '30-min',
  lovedMealDescription: null,
  dislikedMealDescription: null,
  autoPantryDeduct: null,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  onboardingCompletedAt: 1700000000000,
};
