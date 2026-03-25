import { describe, it, expect } from 'vitest';
import { calculateTotals } from './calendar.utils';
import type { PlannedRecipe, NutrientTotals } from './calendar.types';
import type { Recipe } from '../recipes';
import type { Ingredient } from '../ingredients';

function createIngredient(id: string, overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id,
    userId: 'user-1',
    name: `Ingredient ${id}`,
    type: 'produce',
    imageUrl: '',
    nutrients: { protein: 10, carbs: 20, fat: 5, fiber: 3, sugar: 2, sodium: 50, calories: 165 },
    currentAmount: 500,
    servingSize: 100,
    unit: 'g',
    otherUnit: null,
    products: [{ id: 'prod-1', retailer: 'Store', label: 'Product', cost: 6, servings: 3, url: null }],
    defaultProductId: null,
    barcode: null,
    ...overrides,
  };
}

function createRecipe(id: string, ingredientIds: string[]): Recipe {
  return {
    id,
    userId: 'user-1',
    title: `Recipe ${id}`,
    description: '',
    category: 'dinner',
    cuisine: 'italian',
    prepTime: 10,
    cookTime: 20,
    servingSize: 4,
    instructions: [],
    imageUrl: '',
    ingredients: ingredientIds.map((ingredientId) => ({ ingredientId, servings: 2 })),
    share: null,
  };
}

describe('calculateTotals', () => {
  it('returns zero totals when there are no planned recipes', () => {
    const result = calculateTotals([], [], []);
    const expected: NutrientTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, price: 0 };
    expect(result).toEqual(expected);
  });

  it('calculates totals for planned recipes with matching ingredients', () => {
    const ingredients = [createIngredient('ing-1')];
    const recipes = [createRecipe('rec-1', ['ing-1'])];
    const plannedRecipes: PlannedRecipe[] = [
      { id: 'plan-1', userId: 'user-1', recipeId: 'rec-1', date: Date.now(), category: 'dinner', notes: null },
    ];

    const result = calculateTotals(plannedRecipes, recipes, ingredients);
    expect(result.calories).toBe(2 * 165);
    expect(result.protein).toBe(2 * 10);
    expect(result.carbs).toBe(2 * 20);
    expect(result.fat).toBe(2 * 5);
    expect(result.fiber).toBe(2 * 3);
    expect(result.price).toBe(2 * 2);
  });

  it('skips planned recipes when recipe is not found', () => {
    const ingredients = [createIngredient('ing-1')];
    const recipes = [createRecipe('rec-1', ['ing-1'])];
    const plannedRecipes: PlannedRecipe[] = [
      { id: 'plan-1', userId: 'user-1', recipeId: 'nonexistent', date: Date.now(), category: 'dinner', notes: null },
    ];

    const result = calculateTotals(plannedRecipes, recipes, ingredients);
    expect(result.calories).toBe(0);
  });

  it('skips ingredients that are not found', () => {
    const ingredients = [createIngredient('ing-1')];
    const recipes = [createRecipe('rec-1', ['ing-1', 'missing-ing'])];
    const plannedRecipes: PlannedRecipe[] = [
      { id: 'plan-1', userId: 'user-1', recipeId: 'rec-1', date: Date.now(), category: 'dinner', notes: null },
    ];

    const result = calculateTotals(plannedRecipes, recipes, ingredients);
    expect(result.calories).toBe(2 * 165);
  });

  it('accumulates totals across multiple planned recipes', () => {
    const ingredients = [createIngredient('ing-1')];
    const recipes = [createRecipe('rec-1', ['ing-1'])];
    const plannedRecipes: PlannedRecipe[] = [
      { id: 'plan-1', userId: 'user-1', recipeId: 'rec-1', date: Date.now(), category: 'dinner', notes: null },
      { id: 'plan-2', userId: 'user-1', recipeId: 'rec-1', date: Date.now(), category: 'lunch', notes: null },
    ];

    const result = calculateTotals(plannedRecipes, recipes, ingredients);
    expect(result.calories).toBe(4 * 165);
  });
});
