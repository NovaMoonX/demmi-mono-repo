import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RecipeDetail } from './RecipeDetail';
import type { Recipe } from '@lib/recipes';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useLocation: () => ({ state: null, pathname: '/recipes/new' }),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

vi.mock('@components/recipes/RecipeIngredientSelector', () => ({
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
  beforeEach(() => {
    mockUseParams.mockReturnValue({ id: 'new' });
  });

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
    mockUseParams.mockReturnValue({ id: 'rec-1' });
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
