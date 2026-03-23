import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { RecipeDetail } from './RecipeDetail';
import type { Recipe } from '@lib/recipes';

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
  it('renders the form for a new recipe', () => {
    const { wrapper } = generateTestWrapper({ route: '/recipes/new', path: '/recipes/:id' });
    render(<RecipeDetail />, { wrapper });
    expect(screen.getByText('Create Recipe')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders the back link', () => {
    const { wrapper } = generateTestWrapper({ route: '/recipes/new', path: '/recipes/:id' });
    render(<RecipeDetail />, { wrapper });
    expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
  });
});

describe('RecipeDetail - View Mode', () => {
  it('renders the recipe title in view mode', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({
      route: '/recipes/rec-1',
      path: '/recipes/:id',
      preloadedState: { recipes: { items: [recipe] } },
    });
    render(<RecipeDetail />, { wrapper });
    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
  });

  it('renders Edit, Delete, and Cook buttons in view mode', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({
      route: '/recipes/rec-1',
      path: '/recipes/:id',
      preloadedState: { recipes: { items: [recipe] } },
    });
    render(<RecipeDetail />, { wrapper });
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delete').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🍳 Cook').length).toBeGreaterThan(0);
  });

  it('renders prep time and cook time', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({
      route: '/recipes/rec-1',
      path: '/recipes/:id',
      preloadedState: { recipes: { items: [recipe] } },
    });
    render(<RecipeDetail />, { wrapper });
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('renders instructions', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({
      route: '/recipes/rec-1',
      path: '/recipes/:id',
      preloadedState: { recipes: { items: [recipe] } },
    });
    render(<RecipeDetail />, { wrapper });
    expect(screen.getByText('Boil pasta')).toBeInTheDocument();
    expect(screen.getByText('Make sauce')).toBeInTheDocument();
  });
});
