import { describe, it, expect } from 'vitest';
import reducer, {
  addPlannedRecipe,
  updatePlannedRecipe,
  removePlannedRecipe,
  setPlannedRecipes,
  resetCalendar,
} from './calendarSlice';
import type { PlannedRecipe } from '@lib/calendar';

const samplePlannedRecipe: PlannedRecipe = {
  id: 'plan-1',
  userId: 'user-1',
  recipeId: 'rec-1',
  date: 1700000000000,
  category: 'dinner',
  notes: null,
};

describe('calendarSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ plannedRecipes: [] });
  });

  it('handles addPlannedRecipe', () => {
    const { id: _id, ...withoutId } = samplePlannedRecipe;
    const state = reducer(undefined, addPlannedRecipe(withoutId));
    expect(state.plannedRecipes).toHaveLength(1);
    expect(state.plannedRecipes[0].recipeId).toBe('rec-1');
    expect(state.plannedRecipes[0].id).toBeTruthy();
  });

  it('handles updatePlannedRecipe', () => {
    const initial = { plannedRecipes: [samplePlannedRecipe] };
    const state = reducer(
      initial,
      updatePlannedRecipe({ id: 'plan-1', updates: { notes: 'Updated note' } }),
    );
    expect(state.plannedRecipes[0].notes).toBe('Updated note');
  });

  it('handles removePlannedRecipe', () => {
    const initial = { plannedRecipes: [samplePlannedRecipe] };
    const state = reducer(initial, removePlannedRecipe('plan-1'));
    expect(state.plannedRecipes).toHaveLength(0);
  });

  it('handles setPlannedRecipes', () => {
    const items = [samplePlannedRecipe, { ...samplePlannedRecipe, id: 'plan-2' }];
    const state = reducer(undefined, setPlannedRecipes(items));
    expect(state.plannedRecipes).toHaveLength(2);
  });

  it('handles resetCalendar', () => {
    const initial = { plannedRecipes: [samplePlannedRecipe] };
    const state = reducer(initial, resetCalendar());
    expect(state.plannedRecipes).toHaveLength(0);
  });
});
