import reducer, {
  createIngredient,
  updateIngredient,
  deleteIngredient,
  setIngredients,
  resetIngredients,
} from './ingredientsSlice';
import type { Ingredient } from '@lib/ingredients';

const sampleIngredient: Ingredient = {
  id: 'ing-1',
  userId: 'user-1',
  name: 'Chicken',
  type: 'meat',
  imageUrl: '',
  nutrients: { protein: 25, carbs: 0, fat: 5, fiber: 0, sugar: 0, sodium: 70, calories: 165 },
  currentAmount: 1000,
  servingSize: 100,
  unit: 'g',
  otherUnit: null,
  products: [],
  defaultProductId: null,
  barcode: null,
};

describe('ingredientsSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ items: [] });
  });

  it('handles createIngredient without preset id', () => {
    const { id: _id, ...ingredientWithoutId } = sampleIngredient;
    const state = reducer(undefined, createIngredient(ingredientWithoutId));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('Chicken');
    expect(state.items[0].id).toBeTruthy();
  });

  it('handles createIngredient with preset id', () => {
    const { id: _id, ...ingredientWithoutId } = sampleIngredient;
    const state = reducer(undefined, createIngredient({ ...ingredientWithoutId, id: 'preset-id' }));
    expect(state.items[0].id).toBe('preset-id');
  });

  it('handles updateIngredient', () => {
    const initial = { items: [sampleIngredient] };
    const state = reducer(
      initial,
      updateIngredient({ id: 'ing-1', updates: { name: 'Turkey' } }),
    );
    expect(state.items[0].name).toBe('Turkey');
  });

  it('handles deleteIngredient', () => {
    const initial = { items: [sampleIngredient] };
    const state = reducer(initial, deleteIngredient('ing-1'));
    expect(state.items).toHaveLength(0);
  });

  it('handles setIngredients', () => {
    const ingredients = [sampleIngredient, { ...sampleIngredient, id: 'ing-2', name: 'Beef' }];
    const state = reducer(undefined, setIngredients(ingredients));
    expect(state.items).toHaveLength(2);
  });

  it('handles resetIngredients', () => {
    const initial = { items: [sampleIngredient] };
    const state = reducer(initial, resetIngredients());
    expect(state.items).toHaveLength(0);
  });
});
