import { Ingredient } from './ingredients.types';

export function getPricePerServing(ingredient: Ingredient): number {
  const product = ingredient.defaultProductId
    ? (ingredient.products.find((p) => p.id === ingredient.defaultProductId) ??
      ingredient.products[0])
    : ingredient.products[0];

  if (!product || product.servings <= 0) return 0;

  return product.cost / product.servings;
}