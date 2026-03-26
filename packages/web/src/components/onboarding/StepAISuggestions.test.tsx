import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';

vi.mock('@store/actions/recipeActions', async () => {
  const rtk = await vi.importActual('@reduxjs/toolkit') as typeof import('@reduxjs/toolkit');
  return {
    fetchRecipes: rtk.createAsyncThunk('recipes/fetchRecipesAsync', async () => []),
    createRecipe: rtk.createAsyncThunk('recipes/createRecipeAsync', async (params: unknown) => ({
      ...(params as object),
      id: 'mock-id',
      userId: 'mock-user',
    })),
    updateRecipe: rtk.createAsyncThunk('recipes/updateRecipeAsync', async (params: unknown) => params),
    deleteRecipe: rtk.createAsyncThunk('recipes/deleteRecipeAsync', async (id: unknown) => id),
  };
});

vi.mock('@store/actions/shareRecipeActions', async () => {
  const rtk = await vi.importActual('@reduxjs/toolkit') as typeof import('@reduxjs/toolkit');
  return {
    shareRecipe: rtk.createAsyncThunk('recipes/shareRecipeAsync', async (params: unknown) => params),
    unshareRecipe: rtk.createAsyncThunk('recipes/unshareRecipeAsync', async (id: unknown) => id),
  };
});

import { StepAISuggestions } from './StepAISuggestions';
import type { SuggestedRecipe } from './types';

const MOCK_RECIPES: SuggestedRecipe[] = [
  { title: 'Recipe A', category: 'dinner', description: 'Desc A' },
  { title: 'Recipe B', category: 'lunch', description: 'Desc B' },
  { title: 'Recipe C', category: 'breakfast', description: 'Desc C' },
];

describe('StepAISuggestions', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
    aiRecipes: MOCK_RECIPES,
    aiLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    expect(screen.getByText("Here are recipes we think you'll love")).toBeInTheDocument();
  });

  it('shows loading skeletons when aiLoading is true', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} aiLoading aiRecipes={[]} />, { wrapper });
    expect(screen.getAllByLabelText('Loading recipe')).toHaveLength(3);
  });

  it('shows first recipe when loaded', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    expect(screen.getByText('Recipe A')).toBeInTheDocument();
    expect(screen.getByText('Recipe 1 of 3')).toBeInTheDocument();
  });

  it('navigates to next recipe with → button', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    fireEvent.click(screen.getByLabelText('Next recipe'));
    expect(screen.getByText('Recipe B')).toBeInTheDocument();
    expect(screen.getByText('Recipe 2 of 3')).toBeInTheDocument();
  });

  it('navigates back to previous recipe with ← button', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    fireEvent.click(screen.getByLabelText('Next recipe'));
    fireEvent.click(screen.getByLabelText('Previous recipe'));
    expect(screen.getByText('Recipe A')).toBeInTheDocument();
  });

  it('shows "Save this recipe" and "Save all recipes" buttons', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    expect(screen.getByText('Save this recipe')).toBeInTheDocument();
    expect(screen.getByText('Save all recipes')).toBeInTheDocument();
  });

  it('shows "Skip all" button', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    expect(screen.getByText('Skip all')).toBeInTheDocument();
  });

  it('calls skip when "Skip all" is clicked', () => {
    const skip = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} skip={skip} />, { wrapper });
    fireEvent.click(screen.getByText('Skip all'));
    expect(skip).toHaveBeenCalled();
  });

  it('saves all recipes and calls next when "Save all recipes" is clicked', async () => {
    const next = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} next={next} />, { wrapper });
    fireEvent.click(screen.getByText('Save all recipes'));
    await waitFor(() => {
      expect(next).toHaveBeenCalled();
    });
  });

  it('shows ✓ Saved after saving current recipe', async () => {
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    fireEvent.click(screen.getByText('Save this recipe'));
    await waitFor(() => {
      expect(screen.getAllByText('✓ Saved').length).toBeGreaterThanOrEqual(1);
    });
  });
});
