import type { DietaryRestriction, CookingGoal, CookingSkillLevel, CookTimePreference } from './userProfile.types';

export const DIETARY_RESTRICTION_OPTIONS: { value: DietaryRestriction; label: string }[] = [
  { value: 'vegetarian', label: '🥦 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'gluten-free', label: '🌾 Gluten-Free' },
  { value: 'dairy-free', label: '🥛 Dairy-Free' },
  { value: 'halal', label: '☪️ Halal' },
  { value: 'kosher', label: '✡️ Kosher' },
  { value: 'nut-free', label: '🥜 Nut-Free' },
  { value: 'no-restrictions', label: '✅ No restrictions' },
];

export const COOKING_GOAL_OPTIONS: { value: CookingGoal; label: string; description: string }[] = [
  { value: 'eat-healthier', label: '🥦 Eat healthier', description: 'Make nutritious choices and build better eating habits' },
  { value: 'lose-weight', label: '⚖️ Lose weight', description: 'Track calories and make progress toward weight goals' },
  { value: 'save-money', label: '💸 Save money', description: 'Reduce grocery bills and minimize food waste' },
  { value: 'save-time', label: '⏱️ Save time', description: 'Find quick, efficient recipes for busy days' },
  { value: 'reduce-waste', label: '♻️ Reduce waste', description: 'Use up what you have and minimize food waste' },
  { value: 'track-macros', label: '📊 Track macros', description: 'Monitor protein, carbs, and fat for your fitness goals' },
  { value: 'meal-prep', label: '📦 Meal prep', description: 'Batch cook and prep meals for the week ahead' },
  { value: 'explore-cuisines', label: '🌍 Explore cuisines', description: 'Discover new flavors and cooking traditions' },
  { value: 'learn-cooking', label: '👨‍🍳 Learn cooking', description: 'Build skills and try new techniques in the kitchen' },
];

export const HOUSEHOLD_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Just me' },
  { value: 2, label: '2' },
  { value: 3, label: '3-4' },
  { value: 5, label: '5+' },
];

export const SKILL_LEVEL_OPTIONS: { value: CookingSkillLevel; label: string }[] = [
  { value: 'beginner', label: '🔰 Still learning' },
  { value: 'intermediate', label: '👨‍🍳 Home cook' },
  { value: 'advanced', label: '🍴 Pretty experienced' },
];

export const COOK_TIME_OPTIONS: { value: CookTimePreference; label: string }[] = [
  { value: 'under-20', label: 'Under 20 min' },
  { value: '30-min', label: '~30 min' },
  { value: 'under-an-hour', label: 'Under an hour' },
  { value: 'any', label: 'No limit' },
];
