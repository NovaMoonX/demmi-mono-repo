export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';

export interface RecipeIngredient {
  ingredientId: string;
  servings: number; // number of ingredient servings used in this recipe
}

export interface RecipeShare {
  id: string;
  sharedAt: number; // epoch ms when this share was last created/refreshed
}

export type RecipeCuisineType =
  | 'italian'
  | 'mexican'
  | 'chinese'
  | 'japanese'
  | 'thai'
  | 'indian'
  | 'middle-eastern'
  | 'american'
  | 'french'
  | 'greek'
  | (string & {});

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: RecipeCategory;
  cuisine: RecipeCuisineType;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servingSize: number;
  instructions: string[];
  imageUrl: string;
  ingredients: RecipeIngredient[]; // ingredients and quantities used in this recipe
  share: RecipeShare | null;
}
