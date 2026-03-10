export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';

export interface MealIngredient {
  ingredientId: string;
  servings: number; // number of ingredient servings used in this meal
}

export interface Meal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: MealCategory;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servingSize: number;
  instructions: string[];
  imageUrl: string;
  ingredients: MealIngredient[]; // ingredients and quantities used in this meal
}
