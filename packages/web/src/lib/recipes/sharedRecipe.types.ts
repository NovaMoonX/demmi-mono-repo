import { RecipeCategory } from './recipes.types';

export interface SharedRecipeIngredient {
  ingredientId: string;
  name: string;
  servings: number;
  unit: string;
}

export interface SharedRecipe {
  shareId: string;
  recipeId: string;
  userId: string;
  title: string;
  description: string;
  category: RecipeCategory;
  prepTime: number;
  cookTime: number;
  servingSize: number;
  imageUrl: string;
  instructions: string[];
  ingredients: SharedRecipeIngredient[];
  sharedAt: number;
}
