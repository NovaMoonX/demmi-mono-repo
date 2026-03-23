import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { Recipes } from './Recipes';
import type { Recipe } from '@lib/recipes';

vi.mock('@components/recipes/RecipeCard', () => ({
  RecipeCard: ({ recipe, onClick }: { recipe: Recipe; onClick: (r: Recipe) => void }) => (
    <div data-testid={`recipe-card-${recipe.id}`} onClick={() => onClick(recipe)}>
      {recipe.title}
    </div>
  ),
}));

vi.mock('@components/recipes/CreateRecipeModal', () => ({
  CreateRecipeModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-modal">Create Modal</div> : null,
}));

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'rec-1',
    userId: 'user-1',
    title: 'Pasta',
    description: 'Delicious pasta',
    category: 'dinner',
    prepTime: 10,
    cookTime: 20,
    servingSize: 4,
    instructions: [],
    imageUrl: '',
    ingredients: [],
    share: null,
    ...overrides,
  };
}

const mockRecipes: Recipe[] = [
  createRecipe({ id: 'rec-1', title: 'Pasta', category: 'dinner', prepTime: 10, cookTime: 20 }),
  createRecipe({ id: 'rec-2', title: 'Smoothie', description: 'Berry smoothie', category: 'drink', prepTime: 0, cookTime: 5 }),
  createRecipe({ id: 'rec-3', title: 'Steak', category: 'dinner', prepTime: 5, cookTime: 60 }),
];

describe('Recipes Screen', () => {
  it('renders the page title', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: [] } },
    });
    render(<Recipes />, { wrapper });
    expect(screen.getByText('Recipes')).toBeInTheDocument();
  });

  it('renders recipe cards for each recipe', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: mockRecipes } },
    });
    render(<Recipes />, { wrapper });
    expect(screen.getByTestId('recipe-card-rec-1')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-card-rec-2')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-card-rec-3')).toBeInTheDocument();
  });

  it('filters recipes by search query', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: mockRecipes } },
    });
    render(<Recipes />, { wrapper });

    const searchInput = screen.getByPlaceholderText('Search recipes by name or description...');
    fireEvent.change(searchInput, { target: { value: 'Pasta' } });

    expect(screen.getByTestId('recipe-card-rec-1')).toBeInTheDocument();
    expect(screen.queryByTestId('recipe-card-rec-2')).not.toBeInTheDocument();
  });

  it('shows empty message when no recipes match', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: mockRecipes } },
    });
    render(<Recipes />, { wrapper });

    const searchInput = screen.getByPlaceholderText('Search recipes by name or description...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No matching recipes found')).toBeInTheDocument();
  });

  it('renders Create Recipe button', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: [] } },
    });
    render(<Recipes />, { wrapper });
    expect(screen.getByText('Create Recipe')).toBeInTheDocument();
  });

  it('opens create modal when Create Recipe button is clicked', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: [] } },
    });
    render(<Recipes />, { wrapper });

    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Create Recipe'));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('shows clear filters button when no results', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { recipes: { items: mockRecipes } },
    });
    render(<Recipes />, { wrapper });

    const searchInput = screen.getByPlaceholderText('Search recipes by name or description...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });
});
