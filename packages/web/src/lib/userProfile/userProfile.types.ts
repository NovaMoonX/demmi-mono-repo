import { RecipeCuisineType } from '../recipes';

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'halal'
  | 'kosher'
  | 'nut-free'
  | 'no-restrictions'
  | (string & {});

export type CookingGoal =
  | 'eat-healthier'
  | 'lose-weight'
  | 'save-money'
  | 'save-time'
  | 'reduce-waste'
  | 'track-macros'
  | 'meal-prep'
  | 'explore-cuisines'
  | 'learn-cooking';

export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type CookTimePreference = 'under-20' | '30-min' | 'under-an-hour' | 'any';

export type WeightUnit = 'kg' | 'lbs';

export interface CookingGoalDetails {
  'lose-weight': { currentWeight: number; goalWeight: number; weightUnit: WeightUnit } | null;
  'track-macros': { protein: number; carbs: number; fat: number } | null;
  'save-money': { weeklyBudget: number } | null;
  'save-time': { maxCookMinutes: number } | null;
  'reduce-waste': { trackLeftovers: boolean } | null;
  'meal-prep': { daysAhead: number } | null;
}

export interface UserProfile {
  userId: string;
  displayName: string | null;
  dietaryRestrictions: DietaryRestriction[];
  customDietaryRestrictions: string[];
  avoidIngredients: string[];
  cuisinePreferences: RecipeCuisineType[];
  cookingGoal: CookingGoal | null;
  cookingGoalDetails: CookingGoalDetails | null;
  householdSize: number;
  skillLevel: CookingSkillLevel | null;
  cookTimePreference: CookTimePreference | null;
  lovedMealDescription: string | null;
  dislikedMealDescription: string | null;
  autoPantryDeduct: boolean | null;
  createdAt: number;
  updatedAt: number;
  onboardingCompletedAt: number | null;
}
