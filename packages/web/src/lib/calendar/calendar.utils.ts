import { Ingredient } from '../ingredients';
import { getPricePerServing } from '../ingredients/ingredients.utils';
import { Recipe } from '../recipes';
import { NutrientTotals, PlannedRecipe } from './calendar.types';

export function calculateTotals(
  plannedRecipes: PlannedRecipe[],
  recipes: Recipe[],
  ingredients: Ingredient[],
): NutrientTotals {
  const totals: NutrientTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    price: 0,
  };

  for (const pm of plannedRecipes) {
    const recipe = recipes.find((m) => m.id === pm.recipeId);
    if (!recipe) continue;

    for (const mi of recipe.ingredients) {
      const ingredient = ingredients.find((i) => i.id === mi.ingredientId);
      if (!ingredient) continue;

      totals.calories += mi.servings * ingredient.nutrients.calories;
      totals.protein += mi.servings * ingredient.nutrients.protein;
      totals.carbs += mi.servings * ingredient.nutrients.carbs;
      totals.fat += mi.servings * ingredient.nutrients.fat;
      totals.fiber += mi.servings * ingredient.nutrients.fiber;
      totals.price += mi.servings * getPricePerServing(ingredient);
    }
  }

  return totals;
}
