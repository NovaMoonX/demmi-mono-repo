import { RecipeCategory } from './recipes.types';

export const RECIPE_PLACEHOLDER_IMAGE_URL = '/images/recipe-placeholder.jpg';

export const RECIPE_CATEGORIES: RecipeCategory[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'];

export const RECIPE_CATEGORY_COLORS: Record<RecipeCategory, string> = {
  breakfast: 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  lunch: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  dinner: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  snack: 'bg-purple-500/20 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  dessert: 'bg-pink-500/20 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
  drink: 'bg-cyan-500/20 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
};

export const RECIPE_CATEGORY_EMOJIS: Record<RecipeCategory, string> = {
  breakfast: '🌅',
  lunch: '🍱',
  dinner: '🌙',
  snack: '🍿',
  dessert: '🍰',
  drink: '🥤',
};

export const RECIPE_CATEGORY_OPTIONS = RECIPE_CATEGORIES.map((cat) => ({
  value: cat,
  text: `${RECIPE_CATEGORY_EMOJIS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
}));
