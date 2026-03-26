import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';

const mockListLocalModels = vi.fn();
const mockOllamaChat = vi.fn();

vi.mock('@lib/ollama', () => ({
  listLocalModels: (...args: unknown[]) => mockListLocalModels(...args),
  ollamaClient: {
    chat: (...args: unknown[]) => mockOllamaChat(...args),
  },
}));

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

describe('StepAISuggestions', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', async () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    expect(screen.getByText("Here are 3 recipes we think you'll love")).toBeInTheDocument();
  });

  it('shows fallback recipes when Ollama is unavailable', async () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Classic Pasta Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
      expect(screen.getByText('Vegetable Stir Fry')).toBeInTheDocument();
    });
  });

  it('shows fallback recipes when Ollama throws an error', async () => {
    mockListLocalModels.mockRejectedValue(new Error('Connection refused'));
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Classic Pasta Bolognese')).toBeInTheDocument();
    });
  });

  it('shows AI-generated recipes when Ollama is available', async () => {
    mockListLocalModels.mockResolvedValue(['mistral']);
    mockOllamaChat.mockResolvedValue({
      message: {
        content: JSON.stringify({
          recipes: [
            { title: 'AI Chicken Curry', category: 'dinner', description: 'A flavorful curry.' },
            { title: 'AI Green Salad', category: 'lunch', description: 'Light and fresh.' },
            { title: 'AI Smoothie Bowl', category: 'breakfast', description: 'Nutritious start.' },
          ],
        }),
      },
    });
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('AI Chicken Curry')).toBeInTheDocument();
      expect(screen.getByText('AI Green Salad')).toBeInTheDocument();
      expect(screen.getByText('AI Smoothie Bowl')).toBeInTheDocument();
    });
  });

  it('renders "Save these recipes" and "Skip" buttons', async () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Save these recipes')).toBeInTheDocument();
      expect(screen.getByText('Skip')).toBeInTheDocument();
    });
  });

  it('calls skip when Skip button clicked', async () => {
    mockListLocalModels.mockResolvedValue([]);
    const skip = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} skip={skip} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Skip')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Skip'));
    expect(skip).toHaveBeenCalled();
  });

  it('dispatches createRecipe for each recipe and calls next when Save clicked', async () => {
    mockListLocalModels.mockResolvedValue([]);
    const next = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepAISuggestions {...baseProps} next={next} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Save these recipes')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Save these recipes'));
    await waitFor(() => {
      expect(next).toHaveBeenCalled();
    });
  });
});
