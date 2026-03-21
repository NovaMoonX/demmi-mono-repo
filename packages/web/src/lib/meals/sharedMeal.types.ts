import { MealCategory } from './meals.types';

export interface SharedMealIngredient {
  ingredientId: string;
  name: string;
  servings: number;
  unit: string;
}

export interface SharedMeal {
  shareId: string;
  mealId: string;
  userId: string;
  title: string;
  description: string;
  category: MealCategory;
  prepTime: number;
  cookTime: number;
  servingSize: number;
  imageUrl: string;
  instructions: string[];
  ingredients: SharedMealIngredient[];
  sharedAt: number;
}
