import { describe, it, expect } from 'vitest';
import { matchIngredientByName } from './matchIngredientByName';
import type { Ingredient } from '@lib/ingredients';

function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-1',
    userId: 'user-1',
    name: 'Chicken Breast',
    type: 'meat',
    imageUrl: '',
    nutrients: {
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      calories: 165,
    },
    currentAmount: 2,
    servingSize: 0.5,
    unit: 'lb',
    otherUnit: null,
    products: [],
    defaultProductId: null,
    barcode: null,
    ...overrides,
  };
}

describe('matchIngredientByName', () => {
  it('returns the matching ingredient by exact name', () => {
    const ingredients = [createIngredient({ id: 'ing-1', name: 'Chicken Breast' })];
    const result = matchIngredientByName('Chicken Breast', ingredients);
    expect(result?.id).toBe('ing-1');
  });

  it('matches case-insensitively', () => {
    const ingredients = [createIngredient({ id: 'ing-1', name: 'Chicken Breast' })];
    const result = matchIngredientByName('chicken breast', ingredients);
    expect(result?.id).toBe('ing-1');
  });

  it('trims whitespace from the search name', () => {
    const ingredients = [createIngredient({ id: 'ing-1', name: 'Milk' })];
    const result = matchIngredientByName('  Milk  ', ingredients);
    expect(result?.id).toBe('ing-1');
  });

  it('trims whitespace from ingredient names', () => {
    const ingredients = [createIngredient({ id: 'ing-1', name: '  Milk  ' })];
    const result = matchIngredientByName('Milk', ingredients);
    expect(result?.id).toBe('ing-1');
  });

  it('returns null when no match is found', () => {
    const ingredients = [createIngredient({ id: 'ing-1', name: 'Chicken Breast' })];
    const result = matchIngredientByName('Broccoli', ingredients);
    expect(result).toBeNull();
  });

  it('returns null when the ingredient list is empty', () => {
    const result = matchIngredientByName('Chicken Breast', []);
    expect(result).toBeNull();
  });

  it('returns the first match when multiple ingredients share the same name', () => {
    const ingredients = [
      createIngredient({ id: 'ing-1', name: 'Milk' }),
      createIngredient({ id: 'ing-2', name: 'Milk' }),
    ];
    const result = matchIngredientByName('Milk', ingredients);
    expect(result?.id).toBe('ing-1');
  });

  it('does not match partial names', () => {
    const ingredients = [createIngredient({ id: 'ing-1', name: 'Chicken Breast' })];
    const result = matchIngredientByName('Chicken', ingredients);
    expect(result).toBeNull();
  });
});
