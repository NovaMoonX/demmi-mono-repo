import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RecipeFromText } from './RecipeFromText';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

jest.mock('@components/chat/OllamaModelControl', () => ({
  OllamaModelControl: () => <div data-testid="ollama-model-control">OllamaModelControl</div>,
}));

jest.mock('@store/actions/ingredientActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchIngredients: createAsyncThunk('ingredients/fetch', async () => []),
    createIngredient: createAsyncThunk('ingredients/create', async () => ({})),
    updateIngredient: createAsyncThunk('ingredients/update', async () => ({})),
    deleteIngredient: createAsyncThunk('ingredients/delete', async () => ({})),
  };
});

jest.mock('@store/actions/recipeActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchRecipes: createAsyncThunk('recipes/fetch', async () => []),
    createRecipe: createAsyncThunk('recipes/create', async () => ({})),
    updateRecipe: createAsyncThunk('recipes/update', async () => ({})),
    deleteRecipe: createAsyncThunk('recipes/delete', async () => ({})),
  };
});

jest.mock('@store/actions/shareRecipeActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    shareRecipe: createAsyncThunk('recipes/share', async () => ({})),
    unshareRecipe: createAsyncThunk('recipes/unshare', async () => ({})),
    fetchSharedRecipe: createAsyncThunk('recipes/fetchShared', async () => null),
  };
});

jest.mock('@store/actions/shoppingListActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchShoppingList: createAsyncThunk('shoppingList/fetch', async () => []),
    createShoppingListItem: createAsyncThunk('shoppingList/create', async () => ({})),
    updateShoppingListItem: createAsyncThunk('shoppingList/update', async () => ({})),
    deleteShoppingListItem: createAsyncThunk('shoppingList/delete', async () => ({})),
    clearCheckedShoppingListItems: createAsyncThunk('shoppingList/clearChecked', async () => ({})),
  };
});

jest.mock('@lib/ollama/actions', () => ({
  createRecipeAction: {
    execute: jest.fn().mockResolvedValue({ cancelled: false, data: { proposal: null } }),
  },
}));

describe('RecipeFromText', () => {
  it('renders the page title', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByText('Paste Your Recipe')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(
      screen.getByText(
        "Someone sent you a recipe? Paste the full text below and we'll take it from there.",
      ),
    ).toBeInTheDocument();
  });

  it('renders the back link', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
  });

  it('renders the textarea', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('renders Generate and Cancel buttons', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders the OllamaModelControl', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByTestId('ollama-model-control')).toBeInTheDocument();
  });
});
