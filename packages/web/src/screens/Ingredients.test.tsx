import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { Ingredients } from './Ingredients';
import type { Ingredient } from '@lib/ingredients';

vi.mock('@components/ingredients', () => ({
  CreateIngredientModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-modal">Create Modal</div> : null,
  IngredientCard: ({ ingredient, onClick }: { ingredient: Ingredient; onClick: () => void }) => (
    <div data-testid={`ingredient-card-${ingredient.id}`} onClick={onClick}>
      {ingredient.name}
    </div>
  ),
}));

function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-1',
    userId: 'user-1',
    name: 'Chicken',
    type: 'meat',
    imageUrl: '',
    nutrients: { protein: 25, carbs: 0, fat: 5, fiber: 0, sugar: 0, sodium: 70, calories: 165 },
    currentAmount: 500,
    servingSize: 100,
    unit: 'g',
    otherUnit: null,
    products: [],
    defaultProductId: null,
    barcode: null,
    ...overrides,
  };
}

const mockIngredients: Ingredient[] = [
  createIngredient({ id: 'ing-1', name: 'Chicken', type: 'meat', currentAmount: 500 }),
  createIngredient({ id: 'ing-2', name: 'Broccoli', type: 'produce', currentAmount: 200 }),
  createIngredient({ id: 'ing-3', name: 'Rice', type: 'grains', currentAmount: 0 }),
];

describe('Ingredients Screen', () => {
  it('renders the page title', () => {
    renderWithProviders(<Ingredients />, {
      preloadedState: { ingredients: { items: [] } },
    });
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
  });

  it('renders ingredient cards for each ingredient', () => {
    renderWithProviders(<Ingredients />, {
      preloadedState: { ingredients: { items: mockIngredients } },
    });
    expect(screen.getByTestId('ingredient-card-ing-1')).toBeInTheDocument();
    expect(screen.getByTestId('ingredient-card-ing-2')).toBeInTheDocument();
    expect(screen.getByTestId('ingredient-card-ing-3')).toBeInTheDocument();
  });

  it('filters ingredients by search query', () => {
    renderWithProviders(<Ingredients />, {
      preloadedState: { ingredients: { items: mockIngredients } },
    });

    const searchInput = screen.getByPlaceholderText('Search ingredients by name...');
    fireEvent.change(searchInput, { target: { value: 'Chicken' } });

    expect(screen.getByTestId('ingredient-card-ing-1')).toBeInTheDocument();
    expect(screen.queryByTestId('ingredient-card-ing-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ingredient-card-ing-3')).not.toBeInTheDocument();
  });

  it('shows empty message when no ingredients match', () => {
    renderWithProviders(<Ingredients />, {
      preloadedState: { ingredients: { items: mockIngredients } },
    });

    const searchInput = screen.getByPlaceholderText('Search ingredients by name...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/No ingredients found matching/)).toBeInTheDocument();
  });

  it('renders Create Ingredient button', () => {
    renderWithProviders(<Ingredients />, {
      preloadedState: { ingredients: { items: [] } },
    });
    expect(screen.getByText('Create Ingredient')).toBeInTheDocument();
  });

  it('opens create modal when Create Ingredient button is clicked', () => {
    renderWithProviders(<Ingredients />, {
      preloadedState: { ingredients: { items: [] } },
    });

    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Create Ingredient'));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });
});
