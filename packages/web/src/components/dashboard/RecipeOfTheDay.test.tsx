import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { RecipeOfTheDay } from './RecipeOfTheDay';
import type { Recipe } from '@lib/recipes';

vi.mock('@store/actions/calendarActions', () => {
  const { createAsyncThunk } = require('@reduxjs/toolkit');
  return {
    fetchPlannedRecipes: createAsyncThunk('calendar/fetchPlannedRecipes', async () => []),
    createPlannedRecipe: createAsyncThunk(
      'calendar/createPlannedRecipeAsync',
      async (params: Record<string, unknown>) => ({
        ...params,
        id: 'planned-test',
        userId: 'user-1',
      }),
    ),
    updatePlannedRecipe: createAsyncThunk('calendar/updatePlannedRecipeAsync', async (item: unknown) => item),
    deletePlannedRecipe: createAsyncThunk('calendar/deletePlannedRecipeAsync', async (id: string) => id),
  };
});

const mockRecipes: Recipe[] = [
  {
    id: 'rec-1',
    userId: 'user-1',
    title: 'Pancakes',
    description: 'Fluffy pancakes for breakfast',
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
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta',
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

describe('RecipeOfTheDay', () => {
  it('shows empty state when no recipes exist', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: [] } },
    });

    render(<RecipeOfTheDay />, { wrapper });
    expect(
      screen.getByText('Your recipe collection is empty — add your first recipe 🍽️'),
    ).toBeInTheDocument();
    expect(screen.getByText('Add a recipe')).toBeInTheDocument();
  });

  it('shows a recipe when recipes exist', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: mockRecipes } },
    });

    render(<RecipeOfTheDay />, { wrapper });
    expect(screen.getByText('Recipe of the Day')).toBeInTheDocument();
    expect(screen.getByText('Cook this tonight')).toBeInTheDocument();
    expect(screen.getByText('View recipe')).toBeInTheDocument();
  });

  it('displays recipe title and description', () => {
    const singleRecipe: Recipe[] = [mockRecipes[0]];

    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: singleRecipe } },
    });

    render(<RecipeOfTheDay />, { wrapper });
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('Fluffy pancakes for breakfast')).toBeInTheDocument();
  });
});
