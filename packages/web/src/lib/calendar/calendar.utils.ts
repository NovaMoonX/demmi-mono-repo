import { Ingredient } from '../ingredients';
import { getPricePerServing } from '../ingredients/ingredients.utils';
import { Meal } from '../meals';
import { NutrientTotals, PlannedMeal } from './calendar.types';

export function calculateTotals(
  plannedMeals: PlannedMeal[],
  meals: Meal[],
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

  for (const pm of plannedMeals) {
    const meal = meals.find((m) => m.id === pm.mealId);
    if (!meal) continue;

    for (const mi of meal.ingredients) {
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
