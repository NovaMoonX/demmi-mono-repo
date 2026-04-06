import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { TodaysMeals } from './TodaysMeals';
import type { PlannedRecipe } from '@lib/calendar';
import type { Recipe } from '@lib/recipes';

function todayTimestamp(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const mockRecipes: Recipe[] = [
  {
    id: 'rec-1',
    userId: 'user-1',
    title: 'Pancakes',
    description: 'Fluffy pancakes',
    category: 'breakfast',
    cuisine: 'american',
    prepTime: 10,
    cookTime: 15,
    servingSize: 4,
    instructions: ['Mix', 'Cook'],
    imageUrl: '',
    ingredients: [],
    share: null,
  },
  {
    id: 'rec-2',
    userId: 'user-1',
    title: 'Pasta',
    description: 'Italian pasta',
    category: 'dinner',
    cuisine: 'italian',
    prepTime: 15,
    cookTime: 20,
    servingSize: 2,
    instructions: ['Boil', 'Mix'],
    imageUrl: '',
    ingredients: [],
    share: null,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TodaysMeals', () => {
  it('shows empty state when no meals are planned', () => {
    const { wrapper } = generateTestWrapper();
    render(<TodaysMeals />, { wrapper });
    expect(
      screen.getByText('Nothing planned for today — want to add something?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Plan a meal')).toBeInTheDocument();
  });

  it('shows planned meals for today', () => {
    const today = todayTimestamp();
    const plannedRecipes: PlannedRecipe[] = [
      { id: 'plan-1', userId: 'user-1', recipeId: 'rec-1', date: today, category: 'breakfast', notes: null },
      { id: 'plan-2', userId: 'user-1', recipeId: 'rec-2', date: today, category: 'dinner', notes: null },
    ];

    const { wrapper } = generateTestWrapper({
      preloadedState: {
        calendar: { plannedRecipes },
        recipes: { items: mockRecipes },
      },
    });

    render(<TodaysMeals />, { wrapper });
    expect(screen.getByText("Today's Meals")).toBeInTheDocument();
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('Pasta')).toBeInTheDocument();
  });

  it('does not show meals from other days', () => {
    const yesterday = todayTimestamp() - 86400000;
    const plannedRecipes: PlannedRecipe[] = [
      { id: 'plan-1', userId: 'user-1', recipeId: 'rec-1', date: yesterday, category: 'breakfast', notes: null },
    ];

    const { wrapper } = generateTestWrapper({
      preloadedState: {
        calendar: { plannedRecipes },
        recipes: { items: mockRecipes },
      },
    });

    render(<TodaysMeals />, { wrapper });
    expect(
      screen.getByText('Nothing planned for today — want to add something?'),
    ).toBeInTheDocument();
  });

  it('shows "Unknown recipe" when recipe is not found', () => {
    const today = todayTimestamp();
    const plannedRecipes: PlannedRecipe[] = [
      { id: 'plan-1', userId: 'user-1', recipeId: 'missing-recipe', date: today, category: 'lunch', notes: null },
    ];

    const { wrapper } = generateTestWrapper({
      preloadedState: {
        calendar: { plannedRecipes },
        recipes: { items: [] },
      },
    });

    render(<TodaysMeals />, { wrapper });
    expect(screen.getByText('Unknown recipe')).toBeInTheDocument();
  });
});
