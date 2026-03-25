import { describe, it, expect } from 'vitest';
import reducer, {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  setRecipes,
  resetRecipes,
} from './recipesSlice';
import type { Recipe } from '@lib/recipes';

const sampleRecipe: Recipe = {
  id: 'rec-1',
  userId: 'user-1',
  title: 'Pasta',
  description: 'Delicious pasta',
  category: 'dinner',
  cuisine: 'italian',
  prepTime: 10,
  cookTime: 20,
  servingSize: 4,
  instructions: ['Boil water', 'Cook pasta'],
  imageUrl: '',
  ingredients: [{ ingredientId: 'ing-1', servings: 2 }],
  share: null,
};

describe('recipesSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ items: [] });
  });

  it('handles createRecipe', () => {
    const { id: _id, ...recipeWithoutId } = sampleRecipe;
    const state = reducer(undefined, createRecipe(recipeWithoutId));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe('Pasta');
    expect(state.items[0].id).toBeTruthy();
  });

  it('handles updateRecipe', () => {
    const initial = { items: [sampleRecipe] };
    const state = reducer(
      initial,
      updateRecipe({ id: 'rec-1', updates: { title: 'Updated Pasta' } }),
    );
    expect(state.items[0].title).toBe('Updated Pasta');
    expect(state.items[0].description).toBe('Delicious pasta');
  });

  it('does not update if recipe id is not found', () => {
    const initial = { items: [sampleRecipe] };
    const state = reducer(
      initial,
      updateRecipe({ id: 'nonexistent', updates: { title: 'Nope' } }),
    );
    expect(state.items[0].title).toBe('Pasta');
  });

  it('handles deleteRecipe', () => {
    const initial = { items: [sampleRecipe] };
    const state = reducer(initial, deleteRecipe('rec-1'));
    expect(state.items).toHaveLength(0);
  });

  it('handles setRecipes', () => {
    const recipes = [sampleRecipe, { ...sampleRecipe, id: 'rec-2', title: 'Salad' }];
    const state = reducer(undefined, setRecipes(recipes));
    expect(state.items).toHaveLength(2);
  });

  it('handles resetRecipes', () => {
    const initial = { items: [sampleRecipe] };
    const state = reducer(initial, resetRecipes());
    expect(state.items).toHaveLength(0);
  });
});
