import { RecipeCategory } from '@lib/recipes';

export interface PlannedRecipe {
  id: string;
  userId: string;
  recipeId: string;
  date: number; // start-of-day timestamp (ms)
  category: RecipeCategory;
  notes: string | null;
}

export type CalendarView = 'month' | 'day' | 'week' | 'custom';

export interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  price: number;
}
