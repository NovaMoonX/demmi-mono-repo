import { capitalizeCuisine } from './recipe.utils';
import { RecipeCategory, RecipeCuisineType } from './recipes.types';

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

export const RECIPE_CUISINES: RecipeCuisineType[] = [
  'italian',
  'mexican',
  'chinese',
  'japanese',
  'thai',
  'indian',
  'middle-eastern',
  'american',
  'french',
  'greek',
];

export const RECIPE_CUISINE_COLORS: Record<string, string> = {
  italian: 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  mexican: 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  chinese: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  japanese: 'bg-rose-500/20 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  thai: 'bg-lime-500/20 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400',
  indian: 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'middle-eastern': 'bg-teal-500/20 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  american: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  french: 'bg-indigo-500/20 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  greek: 'bg-sky-500/20 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
};

export const RECIPE_CUISINE_EMOJIS: Record<string, string> = {
  italian: '🍝',
  mexican: '🌮',
  chinese: '🥢',
  japanese: '🍣',
  thai: '🍜',
  indian: '🍛',
  'middle-eastern': '🧆',
  american: '🍔',
  french: '🥐',
  greek: '🫒',
};

export const RECIPE_CUISINE_OPTIONS = RECIPE_CUISINES.map((cuisine) => ({
  value: cuisine,
  text: `${RECIPE_CUISINE_EMOJIS[cuisine]} ${capitalizeCuisine(cuisine)}`,
}));
