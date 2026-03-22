import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RecipeDetail } from './RecipeDetail';
import type { Recipe } from '@lib/recipes';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'new' }),
  useLocation: () => ({ state: null, pathname: '/recipes/new' }),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

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

jest.mock('@components/recipes/RecipeIngredientSelector', () => ({
  RecipeIngredientSelector: () => (
    <div data-testid="recipe-ingredient-selector">RecipeIngredientSelector</div>
  ),
}));

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'rec-1',
    userId: 'user-1',
    title: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta dish',
    category: 'dinner',
    prepTime: 15,
    cookTime: 45,
    servingSize: 4,
    instructions: ['Boil pasta', 'Make sauce', 'Combine'],
    imageUrl: '',
    ingredients: [],
    share: null,
    ...overrides,
  };
}

describe('RecipeDetail - New Mode', () => {
  it('renders the form for a new recipe', () => {
    renderWithProviders(<RecipeDetail />);
    expect(screen.getByText('Create Recipe')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders the back link', () => {
    renderWithProviders(<RecipeDetail />);
    expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
  });
});

describe('RecipeDetail - View Mode', () => {
  beforeEach(() => {
    const reactRouterDom = jest.requireMock('react-router-dom');
    reactRouterDom.useParams = () => ({ id: 'rec-1' });
  });

  it('renders the recipe title in view mode', () => {
    const recipe = createRecipe();
    renderWithProviders(<RecipeDetail />, {
      preloadedState: { recipes: { items: [recipe] } },
    });
    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
  });

  it('renders Edit, Delete, and Cook buttons in view mode', () => {
    const recipe = createRecipe();
    renderWithProviders(<RecipeDetail />, {
      preloadedState: { recipes: { items: [recipe] } },
    });
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delete').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🍳 Cook').length).toBeGreaterThan(0);
  });

  it('renders prep time and cook time', () => {
    const recipe = createRecipe();
    renderWithProviders(<RecipeDetail />, {
      preloadedState: { recipes: { items: [recipe] } },
    });
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('renders instructions', () => {
    const recipe = createRecipe();
    renderWithProviders(<RecipeDetail />, {
      preloadedState: { recipes: { items: [recipe] } },
    });
    expect(screen.getByText('Boil pasta')).toBeInTheDocument();
    expect(screen.getByText('Make sauce')).toBeInTheDocument();
  });
});
