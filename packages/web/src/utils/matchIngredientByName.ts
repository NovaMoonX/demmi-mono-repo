import type { Ingredient } from '@lib/ingredients';

export function matchIngredientByName(
  name: string,
  ingredients: Ingredient[]
): Ingredient | null {
  const normalized = name.trim().toLowerCase();
  const result = ingredients.find(
    (i) => i.name.trim().toLowerCase() === normalized
  ) ?? null;
  return result;
}
